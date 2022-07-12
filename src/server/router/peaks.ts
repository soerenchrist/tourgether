import { createPeakValidationSchema } from "@/pages/peaks/create";
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
  .query("get-peak-by-id", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.email;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return await ctx.prisma.peak.findFirst({
        where: {
          AND: [
            {
              id: input.id,
            },
            {
              OR: [
                {
                  creatorId: null,
                },
                {
                  creatorId: userId,
                },
              ],
            },
          ],
        },
      });
    },
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
  .mutation("delete-peak", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.email;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const result = await ctx.prisma.peak.deleteMany({
        where: {
          id: input.id,
          creatorId: userId,
        },
      });
      // You are not allowed to delete peaks that aren't created by you
      if (result.count !== 1) throw new TRPCError({ code: "UNAUTHORIZED" });
    },
  })
  .mutation("create-peak", {
    input: createPeakValidationSchema,
    async resolve({ ctx, input }) {
      const userId = ctx.session?.user?.email;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const peak = {
        creatorId: userId,
        ...input,
      };

      return await ctx.prisma.peak.create({
        data: peak,
      });
    },
  });
