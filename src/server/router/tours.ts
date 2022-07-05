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
      id: z.string()
    }),
    async resolve({ input, ctx }) {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return await ctx.prisma.tour.findFirst({
        where: {
          creatorId: userId,
          id: input.id
        }
      })
    }
  });
