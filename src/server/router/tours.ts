import { createTourValidationSchema } from "@/components/tours/editToursForm";
import { getDateXDaysBeforeToday } from "@/utils/dateUtils";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";
import { getFriends, isFriend } from "./friends";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as uuid from "uuid";
import { s3Client } from "@/lib/s3Lib";
import { Tour } from "@prisma/client";

export type Point = {
  latitude: number;
  longitude: number;
  elevation: number;
  heartRate?: number;
  temperature?: number;
  time?: Date;
};

const deleteS3File = async (url: string) => {
  const s3 = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.AWS_BUCKET_ACCESS_KEY_SECRET || "",
    },
  });

  const command = new DeleteObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: url,
  });

  await s3.send(command);
};

export const toursRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    const userId = ctx?.session?.user?.id;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, userId } });
  })
  .query("get-tours", {
    input: z.object({
      page: z.number().min(1),
      count: z.number(),
      searchTerm: z.string(),
      userId: z.string().optional(),
      orderBy: z.string().optional(),
      orderDir: z.enum(["asc", "desc"]).optional(),
    }),
    async resolve({ ctx, input }) {
      const orderBy = (input.orderBy ?? "date") as keyof Tour;
      const orderDir = input.orderDir ?? "desc";
      const { count, page } = input;
      const skip = count * (page - 1);

      const searchFilter = {
        OR: [
          {
            name: {
              contains: input.searchTerm,
            },
          },
          {
            description: {
              contains: input.searchTerm,
            },
          },
        ],
      };

      let userId = ctx.userId;
      let visibilityFilter = {};
      if (input.userId) {
        userId = input.userId;
        const friend = await isFriend(ctx.prisma, ctx.userId, input.userId);
        const visibilities = ["PUBLIC"];
        if (friend) visibilities.push("FRIENDS");

        visibilityFilter = {
          visibility: {
            in: visibilities,
          },
        };
      }

      const tours = await ctx.prisma.tour.findMany({
        skip: skip,
        take: count,
        where: {
          AND: [
            {
              OR: [
                {
                  creatorId: userId,
                },
                {
                  companions: {
                    some: {
                      userId: userId,
                    },
                  },
                },
              ],
            },
            {
              ...searchFilter,
              ...visibilityFilter,
            },
          ],
        },
        orderBy: {
          [orderBy]: orderDir,
        },
      });
      const totalCount = await ctx.prisma.tour.count({
        where: {
          creatorId: userId,
          ...searchFilter,
        },
      });
      return {
        tours: tours,
        totalCount: totalCount,
      };
    },
  })
  .query("get-tour-by-id", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const include = {
        tourPeaks: {
          include: {
            peak: true,
          },
        },
        creator: true,
      };
      const tour = await ctx.prisma.tour.findFirst({
        where: {
          id: input.id,
          OR: [
            {
              creatorId: ctx.userId,
            },
            {
              visibility: "PUBLIC",
            },
          ],
        },
        include,
      });
      if (tour) return { viewer: tour.creatorId !== ctx.userId, ...tour };

      const friends = await getFriends(ctx.prisma, ctx.userId);
      const friendsIds = friends.map((f) => f.id);
      const friendsTour = await ctx.prisma.tour.findFirst({
        where: {
          creatorId: {
            in: friendsIds,
          },
          id: input.id,
        },
        include,
      });

      if (!friendsTour) throw new TRPCError({ code: "NOT_FOUND" });
      return { viewer: true, ...friendsTour };
    },
  })
  .query("search-tours", {
    input: z.object({
      searchTerm: z.string(),
      peakId: z.string().optional(),
    }),
    async resolve({ ctx, input }) {
      const peakQuery = input.peakId
        ? {
            tourPeaks: {
              some: {
                peakId: input.peakId,
              },
            },
          }
        : {};
      const friends = await getFriends(ctx.prisma, ctx.userId);
      const friendsIds = friends.map((x) => x.id);
      return await ctx.prisma.tour.findMany({
        take: 10,
        where: {
          name: {
            contains: input.searchTerm,
          },
          OR: [
            {
              visibility: "PUBLIC",
            },
            {
              creatorId: ctx.userId,
            },
            {
              creatorId: {
                in: friendsIds,
              },
            },
          ],
          ...peakQuery,
        },
        include: {
          creator: true,
        },
      });
    },
  })
  .query("get-companions", {
    input: z.object({
      tourId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const companions = await ctx.prisma.companionShip.findMany({
        where: {
          tourId: input.tourId,
        },
        include: {
          user: true,
        },
      });
      return companions;
    },
  })
  .query("count-peaks-reached", {
    input: z
      .object({
        userId: z.string().optional(),
      })
      .optional(),
    async resolve({ ctx, input }) {
      let userId = ctx.userId;
      if (input?.userId) {
        userId = input.userId;
      }

      const results = await ctx.prisma.tourPeak.findMany({
        where: {
          tour: {
            OR: [
              {
                creatorId: userId,
              },
              {
                companions: {
                  some: {
                    userId: userId,
                  },
                },
              },
            ],
          },
        },
        include: {
          peak: true,
        },
        distinct: ["peakId"],
      });
      return results.length;
    },
  })
  .query("get-totals", {
    input: z
      .object({
        userId: z.string().optional(),
      })
      .optional(),
    async resolve({ ctx, input }) {
      let userId = ctx.userId;
      if (input?.userId) {
        const user = await ctx.prisma.user.findUnique({
          where: {
            id: input.userId,
          },
          include: {
            profile: true,
          },
        });
        if (user?.profile?.visibility === "PUBLIC") userId = input.userId;
        else throw new TRPCError({ code: "NOT_FOUND" });
      }

      const aggregate = await ctx.prisma.tour.aggregate({
        _sum: {
          distance: true,
          elevationDown: true,
          elevationUp: true,
        },
        _count: {
          _all: true,
        },
        where: {
          OR: [
            {
              creatorId: userId,
            },
            {
              companions: {
                some: {
                  userId: userId,
                },
              },
            },
          ],
        },
      });
      return {
        count: aggregate._count._all,
        ...aggregate._sum,
      };
    },
  })
  .query("get-history", {
    input: z.object({}),
    async resolve({ ctx }) {
      const distance: { date: Date; value: number }[] = [];
      const elevationUp: { date: Date; value: number }[] = [];
      const elevationDown: { date: Date; value: number }[] = [];

      for (let i = 12; i >= 0; i--) {
        const startOfRange = getDateXDaysBeforeToday(i * 30);
        const endOfRange = getDateXDaysBeforeToday((i - 1) * 30);

        const result = await ctx.prisma.tour.aggregate({
          where: {
            AND: [
              {
                date: {
                  gt: startOfRange,
                },
              },
              {
                date: {
                  lte: endOfRange,
                },
              },
              {
                OR: [
                  {
                    creatorId: ctx.userId,
                  },
                  {
                    companions: {
                      some: {
                        userId: ctx.userId,
                      },
                    },
                  },
                ],
              },
            ],
          },
          _sum: {
            distance: true,
            elevationDown: true,
            elevationUp: true,
          },
        });
        distance.push({
          date: endOfRange,
          value: result._sum.distance || 0,
        });

        elevationUp.push({
          date: endOfRange,
          value: result._sum.elevationUp || 0,
        });

        elevationDown.push({
          date: endOfRange,
          value: result._sum.elevationDown || 0,
        });
      }

      return [
        { label: "Distance", data: distance },
        { label: "Elevation Up", data: elevationUp },
        { label: "Elevation Down", data: elevationDown },
      ];
    },
  })
  .query("get-download-url", {
    input: z.object({
      gpxUrl: z.string(),
    }),
    async resolve({ input }) {
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: input.gpxUrl,
      };

      const command = new GetObjectCommand(params);
      const url = await getSignedUrl(s3Client, command, {
        expiresIn: 360,
      });

      return url;
    },
  })
  .mutation("delete-tour", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const tour = await ctx.prisma.tour.findFirst({
        where: {
          id: input.id,
        },
      });
      if (!tour) throw new TRPCError({ code: "NOT_FOUND" });

      if (tour.gpxUrl) {
        await deleteS3File(tour.gpxUrl);
      }

      const images = await ctx.prisma.image.findMany({
        where: {
          tourId: input.id,
        },
      });
      await ctx.prisma.image.deleteMany({
        where: {
          tourId: input.id,
        },
      });

      for (let i = 0; i < images.length; i++) {
        const image = images[i]!;

        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: image.url,
        });
        await s3Client.send(deleteCommand);
      }

      await ctx.prisma.companionShip.deleteMany({
        where: {
          tourId: input.id,
        },
      });

      await ctx.prisma.like.deleteMany({
        where: {
          tourId: input.id,
        },
      });
      await ctx.prisma.comment.deleteMany({
        where: {
          tourId: input.id,
        },
      });

      await ctx.prisma.tourPeak.deleteMany({
        where: {
          tourId: input.id,
        },
      });
      await ctx.prisma.tour.delete({
        where: {
          id: input.id,
        },
      });
    },
  })
  .mutation("update-tour", {
    input: z.object({
      tour: createTourValidationSchema.merge(
        z.object({
          visibility: z.enum(["PRIVATE", "PUBLIC", "FRIENDS"]),
          id: z.string(),
        })
      ),
      peaks: z
        .object({
          id: z.string(),
        })
        .array(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.tourPeak.deleteMany({
        where: {
          tourId: input.tour.id,
        },
      });

      const updatedTour = await ctx.prisma.tour.update({
        where: {
          id: input.tour.id,
        },
        data: {
          ...input.tour,
          date: new Date(input.tour.date),
        },
      });
      const tourPeaks: { tourId: string; peakId: string }[] = [];
      for (let i = 0; i < input.peaks.length; i++) {
        const peak = input.peaks[i];
        if (!peak) continue;

        const tourPeak = {
          tourId: input.tour.id,
          peakId: peak.id,
        };

        tourPeaks.push(tourPeak);
      }

      await ctx.prisma.tourPeak.createMany({
        data: tourPeaks,
      });
      return updatedTour;
    },
  })
  .mutation("create-tour", {
    input: z.object({
      tour: createTourValidationSchema.merge(
        z.object({
          visibility: z.enum(["PRIVATE", "PUBLIC", "FRIENDS"]),
          gpxUrl: z.string().nullish(),
        })
      ),
      peaks: z
        .object({
          id: z.string(),
        })
        .array(),
    }),
    async resolve({ input, ctx }) {
      const tour = {
        creatorId: ctx.userId,
        ...input.tour,
        date: new Date(input.tour.date),
      };

      const insertedTour = await ctx.prisma.tour.create({
        data: tour,
      });

      const tourPeaks: { tourId: string; peakId: string }[] = [];
      for (let i = 0; i < input.peaks.length; i++) {
        const peak = input.peaks[i];
        if (!peak) continue;

        const tourPeak = {
          tourId: insertedTour.id,
          peakId: peak.id,
        };

        tourPeaks.push(tourPeak);
      }

      await ctx.prisma.tourPeak.createMany({
        data: tourPeaks,
      });

      return insertedTour;
    },
  })
  .mutation("add-companion", {
    input: z.object({
      userId: z.string(),
      tourId: z.string(),
      role: z.enum(["MAINTAINER", "VIEWER"]),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.companionShip.create({
        data: input,
      });
    },
  })
  .mutation("remove-companion", {
    input: z.object({
      userId: z.string(),
      tourId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.companionShip.delete({
        where: {
          tourId_userId: {
            tourId: input.tourId,
            userId: input.userId,
          },
        },
      });
    },
  })
  .mutation("create-upload-url", {
    input: z.object({
      tourId: z.string().optional(),
    }),
    async resolve({ ctx, input }) {
      let file = `${ctx.userId}/tracks/${uuid.v4()}.gpx`;
      if (input.tourId) {
        const tour = await ctx.prisma.tour.findFirst({
          where: {
            id: input.tourId,
          },
        });

        if (tour && tour.gpxUrl) {
          file = tour.gpxUrl;
        }
      }

      const bucketParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file,
      };
      const command = new PutObjectCommand(bucketParams);
      const result = await getSignedUrl(s3Client, command);

      return {
        url: result,
        filename: file,
      };
    },
  });
