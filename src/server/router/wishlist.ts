import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const wishlistRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    const userId = ctx?.session?.user?.id;
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
  .query("check-peaks", {
    input: z.object({
      peakIds: z.string().array(),
    }),
    async resolve({ ctx, input }) {
      const results = await ctx.prisma.wishlistItem.findMany({
        where: {
          peakId: {
            in: input.peakIds,
          },
          userId: ctx.userId,
        },
        include: {
          peak: true,
        },
      });

      return results;
    },
  })
  .mutation("complete-items", {
    input: z.object({
      itemIds: z.string().array(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.wishlistItem.updateMany({
        data: {
          finishDate: new Date(),
          finished: true,
        },
        where: {
          id: {
            in: input.itemIds,
          },
        },
      });
    },
  })
  
  .mutation("uncomplete-items", {
    input: z.object({
      itemIds: z.string().array(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.wishlistItem.updateMany({
        data: {
          finishDate: null,
          finished: false,
        },
        where: {
          id: {
            in: input.itemIds,
          },
        },
      });
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
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.wishlistItem.delete({
        where: {
          id: input.id
        },
      });
    },
  });
