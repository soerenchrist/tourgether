import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createRouter } from "./context";

export const likesRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    const userId = ctx?.session?.user?.id;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, userId } });
  })
  .query("like-count", {
    input: z.object({
      tourId: z.string()
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.like.count({
        where: {
          tourId: input.tourId
        }
      });
    }
  })
  .query("get-like", {
    input: z.object({
        tourId: z.string() 
    }),
    async resolve({ ctx, input }) {
        const like = await ctx.prisma.like.findFirst({
          where: {
            tourId: input.tourId,
            userId: ctx.userId
          }
        });

        return like;
    }
  }).mutation("add-like", {
    input: z.object({
      tourId: z.string()
    }),
    async resolve({ ctx, input }) {
      const like = {
        userId: ctx.userId,
        tourId: input.tourId
      };

      return await ctx.prisma.like.create({
        data: like
      });
    }
  }).mutation("remove-like", {
    input: z.object({
      likeId: z.string()
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.like.delete({
        where: {
          id: input.likeId
        }
      });
    }
  })