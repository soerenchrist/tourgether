import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createRouter } from "./context";

export const tracksRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    if (!ctx.session) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next();
  })
  .mutation("upload-track", {
    input: z.object({
      filename: z.string().min(1),
      filecontent: z.string(),
    }),
    async resolve({ input, ctx }) {      
      const userId = ctx.session?.user?.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
      
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME || "",
        Key: input.filename,
        Body: input.filecontent,
        ContentType: "application/gpx+xml"
      }
      
      await ctx.s3.upload(params).promise();
    }
  });
