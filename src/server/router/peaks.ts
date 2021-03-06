import { createPeakValidationSchema } from "@/components/peaks/editPeaksForm";
import { Peak, Tour, TourPeak } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const peaksRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    const userId = ctx?.session?.user?.id;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, userId } });
  })
  .query("get-peak-by-id", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      return await ctx.prisma.peak.findFirst({
        where: {
          AND: [
            {
              id: input.id,
            },
            {
              OR: [
                {
                  creatorId: null,
                },
                {
                  creatorId: ctx.userId,
                },
              ],
            },
          ],
        },
      });
    },
  })
  .query("get-peaks", {
    input: z.object({
      searchTerm: z.string(),
      pagination: z.object({
        page: z.number().min(1),
        count: z.number(),
      }),
      orderBy: z.string().optional(),
      orderDir: z.enum(["asc", "desc"]).optional(),
      onlyClimbed: z.boolean().nullish(),
      bounds: z
        .object({
          minLat: z.number(),
          minLng: z.number(),
          maxLat: z.number(),
          maxLng: z.number(),
        })
        .nullish(),
    }),
    async resolve({ ctx, input }) {
      const orderBy = (input.orderBy ?? "name") as keyof Peak;
      const orderDir = input.orderDir ?? "asc";
      const { count, page } = input.pagination;
      const skip = count * (page - 1);

      let peaks: (Peak & {
        tourPeaks: TourPeak[];
      })[];

      const boundsQuery = input.bounds
        ? {
            latitude: {
              gte: input.bounds.minLat,
              lte: input.bounds.maxLat,
            },
            longitude: {
              gte: input.bounds.minLng,
              lte: input.bounds.maxLng,
            },
          }
        : {};

      const onlyClimbedQuery = input.onlyClimbed
        ? {
            tourPeaks: {
              some: {
                peakId: {
                  startsWith: "",
                },
                tour: {
                  OR: [
                    {
                      creatorId: ctx.userId,
                    },
                    {
                      companions: {
                        some: {
                          userId: ctx.userId,
                        },
                      },
                    },
                  ],
                },
              },
            },
          }
        : {};

      peaks = await ctx.prisma.peak.findMany({
        take: count,
        skip: skip,
        orderBy: {
          [orderBy]: orderDir,
        },
        where: {
          ...boundsQuery,
          ...onlyClimbedQuery,

          name: {
            contains: input.searchTerm,
          },
          OR: [
            {
              creatorId: null,
            },
            {
              creatorId: ctx.userId,
            },
          ],
        },
        include: {
          tourPeaks: {
            where: {
              tour: {
                OR: [
                  {
                    creatorId: ctx.userId,
                  },
                  {
                    companions: {
                      some: {
                        userId: ctx.userId,
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      });
      const totalCount = await ctx.prisma.peak.count({
        where: {
          OR: [
            {
              creatorId: null,
            },
            {
              creatorId: ctx.userId,
            },
          ],
          ...onlyClimbedQuery,
          ...boundsQuery,
          name: {
            contains: input.searchTerm,
          },
        },
      });

      const peaksResult = peaks.map((p) => ({
        ...p,
        tourCount: p.tourPeaks.length,
      }));

      return {
        peaks: peaksResult,
        totalCount,
      };
    },
  })
  .query("get-tours-by-peak", {
    input: z.object({
      peakId: z.string(),
      onlyOwn: z.boolean().optional(),
      orderBy: z.string().optional(),
      orderDir: z.enum(["asc", "desc"]).optional(),
    }),
    async resolve({ ctx, input }) {
      const onlyOwn = input.onlyOwn ?? false;
      const orderBy = (input.orderBy ?? "date") as keyof Tour;
      const orderDir = input.orderDir ?? "desc";

      const myToursFilter = [
        {
          creatorId: ctx.userId,
        },
        {
          companions: {
            some: {
              userId: ctx.userId,
            },
          },
        },
      ];

      let creatorFilter = {};
      if (onlyOwn) {
        creatorFilter = {
          OR: myToursFilter,
        };
      } else {
        creatorFilter = {
          OR: [
            {
              OR: myToursFilter,
            },
            {
              visibility: "PUBLIC",
            },
          ],
        };
      }

      const result = await ctx.prisma.tourPeak.findMany({
        where: {
          peakId: input.peakId,
          tour: {
            ...creatorFilter,
          },
        },
        select: {
          tour: true,
        },
        orderBy: {
          tour: {
            [orderBy]: orderDir,
          },
        },
      });

      return result.map((x) => x.tour);
    },
  })
  .mutation("delete-peak", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ ctx, input }) {
      const result = await ctx.prisma.peak.deleteMany({
        where: {
          id: input.id,
          creatorId: ctx.userId,
        },
      });
      // You are not allowed to delete peaks that aren't created by you
      if (result.count !== 1) throw new TRPCError({ code: "UNAUTHORIZED" });
    },
  })
  .mutation("update-peak", {
    input: createPeakValidationSchema.merge(
      z.object({
        id: z.string(),
      })
    ),
    async resolve({ ctx, input }) {
      const peak = {
        creatorId: ctx.userId,
        ...input,
      };

      return await ctx.prisma.peak.update({
        where: {
          id: input.id,
        },
        data: peak,
      });
    },
  })
  .mutation("create-peak", {
    input: createPeakValidationSchema,
    async resolve({ ctx, input }) {
      const peak = {
        creatorId: ctx.userId,
        ...input,
      };

      return await ctx.prisma.peak.create({
        data: peak,
      });
    },
  });
