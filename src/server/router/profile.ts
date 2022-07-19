import { TRPCError } from "@trpc/server";
import { createRouter } from "./context";
import { z } from "zod";
import { updateProfileValidationSchema } from "@/components/profile/profileForm";

export const profileRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, userId } });
  })
  .query("get-my-profile", {
    async resolve({ ctx }) {
      const profile = await ctx.prisma.profile.findFirst({
        where: {
          id: ctx.userId,
        },
      });
      return profile;
    },
  })
  .mutation("update-profile", {
    input: updateProfileValidationSchema,
    async resolve({ ctx, input }) {
      await ctx.prisma.user.update({
        data: {
          name: input.name,
        },
        where: {
          id: ctx.userId,
        },
      });

      const existing = await ctx.prisma.profile.findFirst({
        where: {
          id: ctx.userId,
        },
      });

      const profileData = {
        favoritePeak: input.favoritePeak,
        status: input.status,
        location: input.location,
      };

      if (existing) {
        await ctx.prisma.profile.update({
          data: profileData,
          where: {
            id: ctx.userId,
          },
        });
      } else {
        await ctx.prisma.profile.create({
          data: {
            id: ctx.userId,
            ...profileData,
          },
        });
      }
    },
  });
