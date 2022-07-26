import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const commentsRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    const userId = ctx?.session?.user?.id;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, userId } });
  })
  .query("get-comments", {
    input: z.object({
      tourId: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.comment.findMany({
        where: {
          tourId: input.tourId,
        },
        include: {
            user: true
        }
      });
    },
  })
  .mutation("add-comment", {
    input: z.object({
        tourId: z.string(),
        content: z.string().max(200).min(1)
    }),
    async resolve({ ctx, input }) {
        const comment = {
            content: input.content,
            userId: ctx.userId,
            tourId: input.tourId
        };
        return await ctx.prisma.comment.create({
            data: comment
        });
    }
  })
