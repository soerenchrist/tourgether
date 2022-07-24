import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";
import { getFriends } from "./friends";

export const feedRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, userId } });
  })
  .query("get-feed", {
    input: z.object({
      count: z.number(),
      page: z.number().min(1),
    }),
    async resolve({ ctx, input }) {
      const friends = await getFriends(ctx.prisma, ctx.userId);
      const userIds = [...friends.map((x) => x.id), ctx.userId];

      const { count, page } = input;
      const skip = count * (page - 1);

      const tours = await ctx.prisma.tour.findMany({
        take: input.count,
        skip: skip,
        where: {
          creatorId: {
            in: userIds,
          },
          visibility: {
            in: ["FRIENDS", "PUBLIC"],
          },
        },
        include: {
          creator: true,
          tourPeaks: {
            include: {
              peak: true
            }
          }
        },
        orderBy: {
          date: "desc",
        },
      });

      return tours;
    },
  })
