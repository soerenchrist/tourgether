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
      pagination: z.object({
        page: z.number().default(1),
        count: z.number().default(10),
      }),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.email;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const { count, page } = input.pagination;
      const skip = count * (page - 1);
      const tours = await ctx.prisma.$queryRaw`SELECT * FROM Tour WHERE creatorId = ${userId}
      UNION (SELECT Tour.* FROM TourViewer as tv
                           INNER JOIN Tour
                           ON Tour.id = tv.tourId
                           WHERE viewerId = ${userId})
              LIMIT ${skip}, ${count};`;
      console.log(tours);
      return tours as Tour[];
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
      });
      if (myTour) return { viewer: false, ...myTour };

      const viewerTour = await ctx.prisma.tourViewer.findFirst({
        where: {
          viewerId: userId,
          tourId: input.id,
        },
        include: {
          tour: true,
        },
      });

      if (!viewerTour) throw new TRPCError({ code: "NOT_FOUND" });

      return { viewer: true, ...viewerTour.tour };
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
  .mutation("create-tour", {
    input: z.object({
      tour: z.object({
        name: z.string().min(1),
        description: z.string(),
        distance: z.number().min(0),
        elevationUp: z.number().min(0),
        elevationDown: z.number().min(0),
        date: z.date(),
        startTime: z.string().nullish(),
        endTime: z.string().nullish(),
      }),
      tracks: z
        .object({
          file_url: z.string(),
          name: z.string(),
          color: z.string(),
        })
        .array(),
    }),
    async resolve({ input, ctx }) {
      const userId = ctx.session?.user?.email;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const tour = {
        creatorId: userId,
        ...input.tour,
      };

      const insertedTour = await ctx.prisma.tour.create({
        data: tour,
      });

      for (let i = 0; i < input.tracks.length; i++) {
        const inputTrack = input.tracks[i];
        if (!inputTrack) continue;
        const track = {
          ...inputTrack,
          tourId: insertedTour.id,
        };
        await ctx.prisma.track.create({
          data: track,
        });
      }

      return insertedTour;
    },
  });
