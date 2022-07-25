import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";
import { PrismaClient, Tour, User } from "@prisma/client";

export type Interaction = {
  id: string;
  date: Date;
  content?: string;
  tour: Tour;
  user: User;
  type: "like" | "comment";
};
export const getFriends = async (prisma: PrismaClient, userId: string) => {
  const friendships = await prisma.friendship.findMany({
    where: {
      state: "ACTIVE",
      OR: [
        {
          user1Id: userId,
        },
        {
          user2Id: userId,
        },
      ],
    },
    include: {
      user1: true,
      user2: true,
    },
  });

  const friends: User[] = [];
  friendships.forEach((f) => {
    if (f.user1Id === userId) friends.push(f.user2);
    else friends.push(f.user1);
  });

  return friends;
};

export const friendsRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, userId } });
  })
  .query("check-friendship-state", {
    input: z.object({
      userId: z.string(),
    }),
    resolve: async ({
      ctx,
      input,
    }): Promise<{ state: "ACTIVE" | "PENDING" | "NO_FRIENDS" }> => {
      const friendship = await ctx.prisma.friendship.findFirst({
        where: {
          OR: [
            {
              user1Id: input.userId,
              user2Id: ctx.userId,
            },
            {
              user1Id: ctx.userId,
              user2Id: input.userId,
            },
          ],
        },
      });

      if (!friendship) {
        return { state: "NO_FRIENDS" };
      }
      return { state: friendship.state };
    },
  })
  .query("get-my-friend-requests", {
    async resolve({ ctx }) {
      return await ctx.prisma.friendship.findMany({
        where: {
          user2Id: ctx.userId,
          state: "PENDING",
        },
        include: {
          user1: true,
        },
      });
    },
  })
  .query("get-my-friends", {
    async resolve({ ctx }) {
      return await getFriends(ctx.prisma, ctx.userId);
    },
  })
  .mutation("decline-friend-request", {
    input: z.object({
      userId: z.string(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.friendship.deleteMany({
        where: {
          user1Id: input.userId,
          user2Id: ctx.userId,
        },
      });
    },
  })
  .mutation("accept-friend-request", {
    input: z.object({
      userId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const invitation = await ctx.prisma.friendship.findFirst({
        where: {
          user1Id: input.userId,
          user2Id: ctx.userId,
        },
      });
      if (!invitation) throw new TRPCError({ code: "NOT_FOUND" });

      invitation.state = "ACTIVE";
      await ctx.prisma.friendship.update({
        data: invitation,
        where: {
          user1Id_user2Id: {
            user1Id: invitation.user1Id,
            user2Id: invitation.user2Id,
          },
        },
      });
    },
  })
  .mutation("quit-friendship", {
    input: z.object({
      userId: z.string(),
    }),
    async resolve({ ctx, input }) {
      console.log("Quit", ctx.userId, input.userId);
      const friendship = await ctx.prisma.friendship.findFirst({
        where: {
          OR: [
            {
              user1Id: ctx.userId,
              user2Id: input.userId,
            },
            {
              user1Id: input.userId,
              user2Id: ctx.userId,
            },
          ],
        },
      });

      if (!friendship) throw new TRPCError({ code: "NOT_FOUND" });

      await ctx.prisma.friendship.delete({
        where: {
          user1Id_user2Id: {
            user1Id: friendship.user1Id,
            user2Id: friendship.user2Id,
          },
        },
      });
    },
  })
  .mutation("create-friendship-request", {
    input: z.object({
      userId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const result = await ctx.prisma.friendship.create({
        data: {
          user1Id: ctx.userId,
          user2Id: input.userId,
          state: "PENDING",
        },
      });
      return result;
    },
  });
