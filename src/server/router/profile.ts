import { TRPCError } from "@trpc/server";
import { createRouter } from "./context";
import { z } from "zod";
import { updateProfileValidationSchema } from "@/components/profile/profileForm";
import { getFriends } from "./friends";
import { CompleteProfile } from "@/components/profile/profileOverview";

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
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: ctx.userId,
        },
        include: {
          profile: true,
        },
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const profile: CompleteProfile = {
        email: user.email || "",
        name: user.profile?.name,
        username: user.name || "",
        favoritePeak: user.profile?.favoritePeak,
        image: user.image,
        location: user.profile?.location,
        status: user.profile?.status,
      };
      return profile;
    },
  })
  .query("has-onboarded", {
    async resolve({ ctx }) {
      const user = await ctx.prisma.user.findUnique({
        where: {
          id: ctx.userId,
        },
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      return {
        hasOnboarded: user.hasOnboarded,
      };
    },
  })
  .query("check-username", {
    input: z.object({
      username: z.string(),
    }),
    async resolve({ ctx, input }) {
      const result = await ctx.prisma.user.findFirst({
        where: {
          name: input.username,
          id: {
            not: ctx.userId,
          },
        },
      });

      return {
        taken: result !== null,
      };
    },
  })
  .query("search-profiles", {
    input: z.object({
      searchTerm: z.string(),
    }),
    async resolve({ input, ctx }) {
      if (input.searchTerm.length === 0) return [];
      const results = await ctx.prisma.user.findMany({
        take: 10,
        include: {
          profile: true
        },
        where: {
          OR: [
            {
              name: {
                contains: input.searchTerm,
              },
            },
            {
              profile: {
                name: {
                  contains: input.searchTerm,
                },
              },
            },
          ],
        },
      });
      return results.map(x => ({
        id: x.id,
        image: x.image,
        username: x.name,
        name: x.profile?.name ?? "-"
      }))
    },
  })
  .query("get-friends-profile", {
    input: z.object({
      userId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const friends = await getFriends(ctx.prisma, ctx.userId);
      const userIds = friends.map((x) => x.id);
      userIds.push(ctx.userId); // include the current user
      if (!userIds.includes(input.userId))
        throw new TRPCError({ code: "NOT_FOUND" });
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: input.userId,
        },
        select: {
          name: true,
          email: true,
          image: true,
          profile: true,
        },
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const profile: CompleteProfile = {
        email: user.email || "",
        name: user.profile?.name,
        username: user.name || "",
        favoritePeak: user.profile?.favoritePeak,
        image: user.image,
        location: user.profile?.location,
        status: user.profile?.status,
      };
      return profile;
    },
  })
  .mutation("update-profile", {
    input: updateProfileValidationSchema,
    async resolve({ ctx, input }) {
      await ctx.prisma.user.update({
        data: {
          name: input.username,
          hasOnboarded: true,
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
        name: input.name,
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
