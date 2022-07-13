import { NextApiHandler } from "next";
import { unstable_getServerSession as getServerSession } from "next-auth";
import { authOptions as nextAuthOptions } from "@/pages/api/auth/[...nextauth]";
import GpxParser, { Point as GPXPoint } from "gpxparser";

const factor = 3;
/*

const convertPoints = (points: GPXPoint[]) => {
  const results: {
    elevation: number;
    latitude: number;
    longitude: number;
    time: Date;
  }[] = [];
  points.forEach((p, i) => {
    // Try to keep the size of the points small
    if (i % factor !== 0) return;
    results.push({
      elevation: p.ele,
      latitude: p.lat,
      longitude: p.lon,
      time: p.time,
    });
  });
  return results;
};
*/
const toDate = (date: Date) => {
  const str = date.toISOString();
  return str.substring(0, 10);
};

const toTime = (date: Date) => {
  const str = date.toISOString();
  const parts = str.split("T");
  return parts[1]?.substring(0, 5);
};

const handler: NextApiHandler = async (req, res) => {
  const session =
    req && res && (await getServerSession(req, res, nextAuthOptions));

  const userId = session?.user?.email;
  if (!userId) return res.status(403).json({ error: "Unauthorized" });

  const body = req.body;
  if (!body) return res.status(400).json({ error: "Missing body " });

  var gpx = new GpxParser();
  /*
  gpx.parse(body);
  const track = gpx.tracks[0];
  if (!track) return res.status(400).json({ error: "Bad GPX file" });

  const points = convertPoints(track.points);
  if (points.length === 0)
    return res.status(400).json({ eror: "Bad GPX file" });

  const result = {
    name: track.name,
    elevationUp: track.elevation.pos,
    elevationDown: track.elevation.neg,
    distance: track.distance.total,
    points,
    date: toDate(points[0]!.time),
    start: toTime(points[0]!.time),
    end: toTime(points[points.length - 1]!.time),
  };*/
  const result = {}
  return res.status(200).json(result);
};

export default handler;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};
