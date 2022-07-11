import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const peaksRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  })
  .query("get-peaks", {
    input: z.object({
      searchTerm: z.string(),
      bounds: z
        .object({
          minLat: z.number(),
          minLng: z.number(),
          maxLat: z.number(),
          maxLng: z.number(),
        })
        .nullish(),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.email;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      if (input.bounds) {
        return await ctx.prisma.peak.findMany({
          where: {
            latitude: {
              gte: input.bounds.minLat,
              lte: input.bounds.maxLat,
            },
            longitude: {
              gte: input.bounds.minLng,
              lte: input.bounds.maxLng,
            },
            name: {
              contains: input.searchTerm,
            },
            OR: [
              {
                creatorId: null,
              },
              {
                creatorId: userId,
              },
            ],
          },
        });
      } else {
        return await ctx.prisma.peak.findMany({
          where: {
            name: {
              contains: input.searchTerm,
            },
            OR: [
              {
                creatorId: null,
              },
              {
                creatorId: userId,
              },
            ],
          },
        });
      }
    },
  })
  .mutation("create-peak", {
    input: z.object({
      name: z.string().min(1),
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
      height: z.number().min(0),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.email;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const peak = {
        creatorId: userId,
        ...input,
      };

      await ctx.prisma.peak.create({
        data: peak,
      });
    },
  });
