import { NextApiHandler } from "next";
import AWS from "aws-sdk";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import * as uuid from "uuid";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_BUCKET_ACCESS_KEY_SECRET,
});

const handler: NextApiHandler = async (req, res) => {
  const session =
    req && res && (await getServerSession(req, res, nextAuthOptions));

  const userId = session?.user?.email;
  if (!userId) return res.status(403).json({ error: "Unauthorized" });

  const body = req.body;
  if (!body) return res.status(400).json({ error: "Missing body " });

  const filename = `${uuid.v4()}.gpx`;
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME || "",
    Key: filename,
    Body: body,
    ContentType: "application/gpx+xml",
  };

  await s3.upload(params).promise();

  return res.status(200).json({ filename, success: true });
};

export default handler;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
