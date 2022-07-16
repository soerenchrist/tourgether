import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";
import * as uuid from "uuid";
import { PrismaClient, User } from "@prisma/client";

export const getFriends = async (prisma: PrismaClient, userId: string) => {
  const friendships = await prisma.friendship.findMany({
    where: {
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
  .query("get-friend-request", {
    input: z.object({
      invite_token: z.string(),
    }),
    async resolve({ ctx, input }) {
      const now = new Date();

      const invitation = await ctx.prisma.friendRequest.findFirst({
        where: {
          token: input.invite_token,
        },
        include: {
          issuedBy: true,
        },
      });
      if (!invitation)
        throw new TRPCError({
          code: "NOT_FOUND",
          message:
            "This invitation is not valid anymore. Please request a new one.",
        });

      if (invitation.validUntil < now) {
        // remove the token
        await ctx.prisma.friendRequest.delete({
          where: {
            id: invitation.id,
          },
        });
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "This invitation has expired. Please request a new one.",
        });
      }

      return invitation;
    },
  })
  .query("get-my-friend-requests", {
    async resolve({ ctx }) {
      return await ctx.prisma.friendRequest.findMany({
        where: {
          issuedById: ctx.userId,
        },
        orderBy: {
          validUntil: "desc",
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
      invite_token: z.string(),
    }),
    async resolve({ ctx, input }) {
      await ctx.prisma.friendRequest.deleteMany({
        where: {
          token: input.invite_token,
        },
      });
    },
  })
  .mutation("accept-friend-request", {
    input: z.object({
      invite_token: z.string(),
    }),
    async resolve({ ctx, input }) {
      const invitation = await ctx.prisma.friendRequest.findFirst({
        where: {
          token: input.invite_token,
        },
      });
      if (!invitation) throw new TRPCError({ code: "NOT_FOUND" });
      if (invitation.issuedById === ctx.userId)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot accept your own invitation",
        });

      const friendship = {
        user1Id: invitation.issuedById,
        user2Id: ctx.userId,
      };

      await ctx.prisma.friendship.create({
        data: friendship,
      });

      await ctx.prisma.friendRequest.delete({
        where: {
          id: invitation.id,
        },
      });
    },
  })
  .mutation("quit-friendship", {
    input: z.object({
      userId: z.string(),
    }),
    async resolve({ ctx, input }) {
      console.log(ctx.userId, input.userId);
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
    async resolve({ ctx }) {
      const now = new Date();
      // valid for 2 days
      now.setDate(now.getDate() + 2);

      const link = {
        issuedById: ctx.userId,
        validUntil: now,
        token: uuid.v4(),
      };

      const result = await ctx.prisma.friendRequest.create({
        data: link,
      });

      const url = `${ctx.req?.headers.host}/invitation/${result.token}`;
      return {
        url,
      };
    },
  });
