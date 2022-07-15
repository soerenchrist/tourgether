import { createTourValidationSchema } from "@/components/tours/editToursForm";
import { getDateXDaysBeforeToday } from "@/utils/dateUtils";
import { Tour } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";
import { getFriends } from "./friends";

export const toursRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    const userId = ctx.session?.user?.email;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, userId } });
  })
  .query("get-tours", {
    input: z.object({
      page: z.number().min(1),
      count: z.number(),
    }),
    async resolve({ ctx, input }) {
      const { count, page } = input;
      const skip = count * (page - 1);

      const tours = await ctx.prisma.tour.findMany({
        skip: skip,
        take: count,
        where: {
          creatorId: ctx.userId,
        },
      });
      const totalCount = await ctx.prisma.tour.count({
        where: {
          creatorId: ctx.userId,
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
      const tour = await ctx.prisma.tour.findFirst({
        where: {
          creatorId: ctx.userId,
          id: input.id,
        },
        include: {
          tourPeaks: {
            include: {
              peak: true,
            },
          },
          points: true,
        },
      });
      if (!tour) throw new TRPCError({ code: "NOT_FOUND" });

      return { viewer: false, ...tour };
    },
  })
  .query("get-totals", {
    async resolve({ ctx }) {
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
          creatorId: ctx.userId,
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
  .query("get-friends-tours", {
    input: z.object({
      count: z.number(),
      page: z.number().min(1),
    }),
    async resolve({ ctx, input }) {
      const friends = await getFriends(ctx.prisma, ctx.userId);

      const userIds = [...friends.map((x) => x.email!), ctx.userId];

      const { count, page } = input;
      const skip = count * (page - 1);

      const tours = ctx.prisma.tour.findMany({
        take: input.count ?? 10,
        skip: skip,
        where: {
          creatorId: {
            in: userIds,
          },
          visibility: {
            in: ["FRIENDS", "PUBLIC"],
          },
        },
        include: {
          creator: true,
        },
        orderBy: {
          date: "desc",
        },
      });

      return tours;
    },
  })
  .mutation("delete-tour", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.point.deleteMany({
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
    input: createTourValidationSchema.merge(
      z.object({
        id: z.string(),
        visibility: z.enum(["PRIVATE", "PUBLIC", "FRIENDS"]),
      })
    ),
    async resolve({ ctx, input }) {
      return await ctx.prisma.tour.update({
        where: {
          id: input.id,
        },
        data: {
          ...input,
          date: new Date(input.date),
        },
      });
    },
  })
  .mutation("create-tour", {
    input: z.object({
      tour: createTourValidationSchema.merge(
        z.object({
          visibility: z.enum(["PRIVATE", "PUBLIC", "FRIENDS"]),
        })
      ),
      points: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
          elevation: z.number(),
          time: z.date(),
          heartRate: z.number().optional(),
          temperature: z.number().optional(),
        })
        .array(),
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

      const points: {
        tourId: string;
        latitude: number;
        longitude: number;
        elevation: number;
        heartRate?: number;
        temperature?: number;
        time: Date;
      }[] = [];
      input.points.forEach((p) => {
        points.push({
          ...p,
          tourId: insertedTour.id,
        });
      });

      await ctx.prisma.point.createMany({
        data: points,
      });

      return insertedTour;
    },
  });
