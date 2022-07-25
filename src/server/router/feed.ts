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
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.date().nullish(),
    }),
    async resolve({ ctx, input }) {
      const friends = await getFriends(ctx.prisma, ctx.userId);
      const userIds = [...friends.map((x) => x.id), ctx.userId];

      const limit = input.limit ?? 30;
      const { cursor } = input;

      const tours = await ctx.prisma.tour.findMany({
        take: limit + 1, // get an extra item at the end which will be used as next cursor
        cursor: cursor ? { createdAt: cursor } : undefined,
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
              peak: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      let nextCursor: typeof cursor | null = null;
      if (tours.length > limit) {
        const nextItem = tours.pop();
        nextCursor = nextItem!.createdAt;
      }

      return {
        tours,
        nextCursor,
      };
    },
  });
