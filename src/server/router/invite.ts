import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const inviteRouter = createRouter()
.middleware(async ({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next();
})
.query("get-invitation", {
  input: z.object({
    invite_token: z.string()
  }),
  async resolve({ ctx, input }) {
    const userId = ctx.session?.user?.email;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const now = new Date();

    const invitation = await ctx.prisma.invitationLink.findFirst({
      where: {
        invite_token: input.invite_token,
      },
      include: {
        tour: true
      }
    });
    if (!invitation) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid invitation" });

    if (invitation.validUnit < now) {
      // remove the token
      await ctx.prisma.invitationLink.delete({
        where: {
          invite_token: input.invite_token
        }
      });
      throw new TRPCError({ code: "NOT_FOUND", message: "Token is not valid anymore" })
    }

    return invitation;
  }
})
.mutation("decline-invitation", {
  input: z.object({
    invite_token: z.string()
  }),
  async resolve({ ctx, input }) {
    await ctx.prisma.invitationLink.delete({
      where: {
        invite_token: input.invite_token
      }
    });
  }
})
.mutation("accept-invitation", {
  input: z.object({
    invite_token: z.string()
  }),
  async resolve({ ctx, input }) {
    const userId = ctx.session?.user?.email;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
    const invitation = await ctx.prisma.invitationLink.findFirst({
      where: {
        invite_token: input.invite_token
      }
    })
    if (!invitation) throw new TRPCError({ code: "NOT_FOUND" });
    if (invitation.issuedBy === userId) throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot accept your own invitation"});

    const viewer = {
      viewerId: userId,
      tourId: invitation.tourId,
    };

    await ctx.prisma.tourViewer.create({
      data: viewer
    })

    await ctx.prisma.invitationLink.delete({
      where: {
        invite_token: input.invite_token
      }
    });
  }
})
.mutation("create-invitation-link", {
  input: z.object({
    tourId: z.string(),
  }),
  async resolve({ctx, input}) {
    const userId = ctx.session?.user?.email;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const now = new Date();
    // valid for 1 day
    now.setDate(now.getDate() + 1);

    const link = {
      issuedBy: userId,
      tourId: input.tourId,
      validUnit: now
    };

    const result = await ctx.prisma.invitationLink.create({
      data: link
    });

    const url = `${ctx.req?.headers.host}/invitation/${result.invite_token}`;
    return {
      url
    };
  }
})