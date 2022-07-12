import { createTourValidationSchema } from "@/pages/tours/create";
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
