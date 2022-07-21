import { TRPCError } from "@trpc/server";
import { createRouter } from "./context";
import { z } from "zod";
import { updateProfileValidationSchema } from "@/components/profile/profileForm";
import { CompleteProfile } from "@/components/profile/profileOverview";
import { Profile } from "@prisma/client";

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
        id: user.id,
        email: user.email || "",
        name: user.profile?.name,
        username: user.name || "",
        favoritePeak: user.profile?.favoritePeak,
        image: user.image,
        location: user.profile?.location,
        status: user.profile?.status,
        visibility: user.profile?.visibility ?? "PUBLIC",
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
          profile: true,
        },
        where: {
          profile: {
            visibility: "PUBLIC",
          },
          id: {
            not: ctx.userId,
          },
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
      return results.map((x) => ({
        id: x.id,
        image: x.image,
        username: x.name,
        name: x.profile?.name ?? "-",
      }));
    },
  })
  .query("get-profile", {
    input: z.object({
      userId: z.string(),
    }),
    async resolve({ ctx, input }) {
      if (input.userId === ctx.userId)
        throw new TRPCError({ code: "BAD_REQUEST" });
      const user = await ctx.prisma.user.findFirst({
        where: {
          id: input.userId,
          OR: [
            {
              profile: {
                visibility: "PUBLIC",
              },
            },
            {
              id: ctx.userId,
            },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          profile: true,
        },
      });
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const profile: CompleteProfile = {
        id: user.id,
        email: user.email || "",
        name: user.profile?.name,
        username: user.name || "",
        favoritePeak: user.profile?.favoritePeak,
        image: user.image,
        location: user.profile?.location,
        status: user.profile?.status,
        visibility: user.profile?.visibility ?? "PRIVATE",
      };
      return profile;
    },
  })
  .mutation("update-profile", {
    input: updateProfileValidationSchema.merge(
      z.object({
        visibility: z.enum(["PUBLIC", "PRIVATE"]),
      })
    ),
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

      const profileData: Omit<Profile, "id"> = {
        name: input.name,
        favoritePeak: input.favoritePeak,
        status: input.status,
        location: input.location,
        visibility: input.visibility,
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
