import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import * as uuid from "uuid";
import { z } from "zod";
import { createRouter } from "./context";
import { s3Client } from "@/lib/s3Lib";

export const imagesRouter = createRouter()
  .middleware(async ({ ctx, next }) => {
    const userId = ctx.session?.userId;
    if (!userId) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({ ctx: { ...ctx, userId } });
  })
  .query("get-images", {
    input: z.object({
      tourId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const images = await ctx.prisma.image.findMany({
        where: {
          tourId: input.tourId,
        },
      });
      const urls = [];
      for (let i = 0; i < images.length; i++) {
        const image = images[i]!;

        const params = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: image.url,
        };

        const command = new GetObjectCommand(params);
        const url = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });
        urls.push({ filename: image.filename, id: image.id, url });
      }
      return urls;
    },
  })
  .mutation("create-upload-url", {
    input: z.object({
      tourId: z.string(),
      filename: z.string(),
    }),
    async resolve({ ctx, input }) {
      const parts = input.filename.split(".");
      const extension = parts[parts.length - 1];
      let file = `${ctx.userId}/${
        input.tourId
      }/images/${uuid.v4()}.${extension}`;
      const bucketParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: file,
      };
      const command = new PutObjectCommand(bucketParams);
      const result = await getSignedUrl(s3Client, command);

      return {
        url: result,
        filename: file,
        originalFilename: input.filename,
      };
    },
  })
  .mutation("save-image", {
    input: z.object({
      filename: z.string(),
      url: z.string(),
      tourId: z.string(),
    }),
    async resolve({ ctx, input }) {
      const index = input.url.search(".com");
      const filename = input.url.slice(index + 5);

      const [url] = filename.split("?");

      await ctx.prisma.image.create({
        data: {
          filename: input.filename,
          url: url!,
          tourId: input.tourId,
        },
      });
    },
  });
