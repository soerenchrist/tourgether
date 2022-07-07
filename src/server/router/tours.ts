import { Track } from "@prisma/client";
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
    async resolve({ ctx }) {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return await ctx.prisma.tour.findMany({
        where: {
          creatorId: userId,
        },
      });
    },
  })
  .query("get-tour-by-id", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return await ctx.prisma.tour.findFirst({
        where: {
          creatorId: userId,
          id: input.id,
        },
      });
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
      const userId = ctx.session?.user?.id;
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
