import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const wishlistRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    const userId = ctx.session?.user?.email;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, userId } });
  })
  .query("get-wishlist", {
    async resolve({ ctx }) {
      return await ctx.prisma.wishlistItem.findMany({
        where: {
          userId: ctx.userId,
        },
        include: {
          peak: true,
        },
      });
    },
  })
  .query("get-wishlist-item", {
    input: z.object({
      peakId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const results = await ctx.prisma.wishlistItem.findMany({
        where: {
          peakId: input.peakId,
          userId: ctx.userId,
        },
      });

      if (results.length !== 1) return null;
      return results[0];
    },
  })
  .mutation("add-to-wishlist", {
    input: z.object({
      peakId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const entry = {
        peakId: input.peakId,
        userId: ctx.userId,
        addDate: new Date(),
      };

      return await ctx.prisma.wishlistItem.create({
        data: entry,
      });
    },
  })
  .mutation("remove-from-wishlist", {
    input: z.object({
      peakId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const result = await ctx.prisma.wishlistItem.deleteMany({
        where: {
          peakId: input.peakId,
          userId: ctx.userId,
        },
      });
      if (result.count !== 1) throw new TRPCError({ code: "NOT_FOUND" });
    },
  });
