import { createTourValidationSchema } from "@/pages/tours/create";
import { getDateXDaysBeforeToday } from "@/utils/dateUtils";
import { Tour } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const toursRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  })
  .query("get-tours", {
    input: z.object({
      page: z.number().min(1),
      count: z.number(),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.email;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const { count, page } = input;
      const skip = count * (page - 1);
      const tours = await ctx.prisma
        .$queryRaw`SELECT * FROM Tour WHERE creatorId = ${userId}
      UNION (SELECT Tour.* FROM TourViewer as tv
                           INNER JOIN Tour
                           ON Tour.id = tv.tourId
                           WHERE viewerId = ${userId})
              ORDER BY date DESC
              LIMIT ${skip}, ${count};`;

      const totalCount = await ctx.prisma
        .$queryRaw`SELECT Count(*) as count FROM (
        SELECT * FROM Tour WHERE creatorId = ${userId}
            UNION (SELECT Tour.* FROM TourViewer as tv
                                 INNER JOIN Tour
                                 ON Tour.id = tv.tourId
                                 WHERE viewerId = ${userId})) as tv`;
      const countResult: any = totalCount;
      return {
        tours: tours as Tour[],
        totalCount: Number(countResult[0].count),
      };
    },
  })
  .query("get-tour-by-id", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const userId = ctx.session?.user?.email;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const myTour = await ctx.prisma.tour.findFirst({
        where: {
          creatorId: userId,
          id: input.id,
        },
        include: {
          viewers: true,
          tourPeaks: {
            include: {
              peak: true,
            },
          },
          points: true,
        },
      });
      if (myTour) return { viewer: false, ...myTour };

      const viewerTour = await ctx.prisma.tourViewer.findFirst({
        where: {
          viewerId: userId,
          tourId: input.id,
        },
        include: {
          tour: {
            include: {
              tourPeaks: {
                include: {
                  peak: true,
                },
              },
              points: true,
            },
          },
        },
      });

      if (!viewerTour) throw new TRPCError({ code: "NOT_FOUND" });

      return { viewer: true, viewers: [], ...viewerTour.tour };
    },
  })
  .query("get-totals", {
    async resolve({ ctx }) {
      const userId = ctx.session?.user?.email;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

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
          creatorId: userId,
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
  .mutation("delete-tour", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.tourViewer.deleteMany({
        where: {
          tourId: input.id,
        },
      });

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
      await ctx.prisma.invitationLink.deleteMany({
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
  .mutation("create-tour", {
    input: z.object({
      tour: createTourValidationSchema,
      points: z
        .object({
          latitude: z.number(),
          longitude: z.number(),
          elevation: z.number(),
          time: z.date(),
        })
        .array(),
      peaks: z
        .object({
          id: z.string(),
        })
        .array(),
    }),
    async resolve({ input, ctx }) {
      const userId = ctx.session?.user?.email;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const tour = {
        creatorId: userId,
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
