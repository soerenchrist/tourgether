import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";
import * as uuid from "uuid"

export const tracksRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  })
  .query("get-tracks-for-tour", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      return await ctx.prisma.track.findMany({
        where: {
          tourId: input.id,
        },
      });
    },
  })
  .query("get-track-content", {
    input: z.object({
      id: z.string(),
    }),
    async resolve({ input, ctx }) {
      const track = await ctx.prisma.track.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!track) throw new TRPCError({ code: "UNAUTHORIZED" });

      const result = await ctx.s3
        .getObject({
          Bucket: process.env.AWS_BUCKET_NAME || "",
          Key: track.file_url,
        })
        .promise();
      if (!result.Body) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const contents = result.Body.toString("utf-8");
      return contents;
    },
  });