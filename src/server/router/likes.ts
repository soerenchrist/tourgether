import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createRouter } from "./context";

export const likesRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, userId } });
  }).query("get-like", {
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
  })