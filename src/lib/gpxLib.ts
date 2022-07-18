import { XMLParser } from "fast-xml-parser";

const toTime = (date: Date) => {
  const hours = "" + date.getHours();
  const minutes = "" + date.getMinutes();

  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
};

type GpxPoint = {
  latitude: number;
  longitude: number;
  elevation: number;
  heartRate?: number;
  temperature?: number;
  time: Date;
};

export type AnalysisResult = {
  distance: number;
  name: string;
  elevationDown: number;
  elevationUp: number;
  date: Date;
  end: string;
  start: string;
  points: GpxPoint[];
};

const getExtensions = (point: any) => {
  const { extensions } = point;
  if (!extensions) return {};
  const ns3 = extensions["ns3:TrackPointExtension"];
  if (!ns3) return {};

  const temperature = ns3["ns3:atemp"] as number;
  const heartRate = ns3["ns3:hr"] as number;

  return {
    temperature,
    heartRate,
  };
};

const getFactor = (totalCount: number) => {
  if (totalCount < 500) return 1;
  if (totalCount < 1000) return 3;
  return 5;
}

export const parseGpx = (content: string): AnalysisResult => {
  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  const { gpx } = parser.parse(content);

  if (!gpx) throw new Error("Invalid gpx file -> no gpx content");

  const { trk } = gpx;
  if (!trk) throw new Error("Invalid gpx file -> no track");

  const { trkseg } = trk;
  if (!trkseg) throw new Error("Invalid gpx file -> no track segment");

  const { trkpt } = trkseg;
  if (!Array.isArray(trkpt))
    throw new Error("Invalid gpx file -> Invalid trkpts");

  const points: GpxPoint[] = [];
  let distance = 0;
  let elevationUp = 0;
  let elevationDown = 0;
  trkpt.forEach((point) => {
    const lng = parseFloat(point["@_lon"]!);
    const lat = parseFloat(point["@_lat"]!);

    const ext = getExtensions(point);

    if (isNaN(lng) || isNaN(lat)) return;
    points.push({
      elevation: point.ele,
      latitude: lat,
      longitude: lng,
      time: new Date(point.time),
      ...ext,
    });
  });

  const factor = getFactor(points.length);
  const sparsedPoints: typeof points = [];
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]!;
    const next = points[i + 1]!;

    const d = calculateDistance(
      current.latitude,
      current.longitude,
      next.latitude,
      next.longitude
    );
    distance += d;
    const ele = next.elevation - current.elevation;
    if (ele > 0) elevationUp += ele;
    else elevationDown += ele * -1;

    // Keep the size of the points small
    if (i % factor === 0) sparsedPoints.push(current);
  }

  return {
    name: trk.name,
    distance,
    elevationUp,
    elevationDown,
    points: sparsedPoints,
    start: toTime(points[0]!.time),
    end: toTime(points[points.length - 1]!.time),
    date: points[0]!.time,
  };
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  var R = 6371 * 1000;
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};

const toRad = (value: number) => {
  return (value * Math.PI) / 180;
};
