import { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import gpxParser, { type Gpx } from "gpx-parser-builder";
import { getFileContents } from "./fileHelpers";

export const calculateBounds = (
  path: { lat: number; lng: number }[]
): LatLngBoundsExpression => {
  let minLat = 90,
    minLng = 180,
    maxLat = -90,
    maxLng = -180;
  path.forEach((coord) => {
    minLat = Math.min(minLat, coord.lat);
    minLng = Math.min(minLng, coord.lng);
    maxLat = Math.max(maxLat, coord.lat);
    maxLng = Math.max(maxLng, coord.lng);
  });

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
};

export const getWaypoints = (gpxContents: string) => {
  const gpx = gpxParser.parse(gpxContents);
  const waypoints = gpx.trk.flatMap((t) => t.trkseg.flatMap((s) => s.trkpt));
  const latLngs: { lat: number; lng: number }[] = waypoints.map((w) => ({
    lat: parseFloat(w.$.lat),
    lng: parseFloat(w.$.lon),
  }));
  return latLngs;
};

export const getGpxStats = async (files: File[]) => {
  const stats: GpxStats[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) continue;

    const contents = await getFileContents(file);
  
    const gpx = gpxParser.parse(contents);
    const stat = calculateStats(gpx);
    stats.push(stat);
  }

  return mergeStats(stats);
};

const mergeStats = (stats: GpxStats[]): GpxStats | null => {
  if (stats.length == 0) return null;
  return {
    name: stats[0]!.name,
    distance: sum((stat) => stat.distance, stats),
    elevationUp: sum((stat) => stat.elevationUp, stats),
    elevationDown: sum((stat) => stat.elevationDown, stats),
    start: stats[0]!.start,
    end: stats[stats.length - 1]!.end,
  };
};

const sum = (selector: (stat: GpxStats) => number, array: GpxStats[]) => {
  let total = 0;
  array.forEach((stat) => {
    const value = selector(stat);
    total += value;
  });
  return total;
};

export type GpxStats = {
  name: string;
  distance: number;
  elevationUp: number;
  elevationDown: number;
  start: Date;
  end: Date;
};

const calculateStats = (gpx: Gpx): GpxStats => {
  const stats = {
    distance: 0,
    elevationUp: 0,
    elevationDown: 0,
  };
  const points = gpx.trk.flatMap((x) => x.trkseg.flatMap((x) => x.trkpt));
  const path: LatLngExpression[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    if (!current) continue;
    if (!next) continue;

    const currentCoord = {
      lat: parseFloat(current.$.lat),
      lng: parseFloat(current.$.lon),
    };
    const nextCoord = {
      lat: parseFloat(next.$.lat),
      lng: parseFloat(next.$.lon),
    };
    path.push(currentCoord);

    const distance = calculateDistance(
      currentCoord.lat,
      currentCoord.lng,
      nextCoord.lat,
      nextCoord.lng
    );

    stats.distance += distance;

    const currentEle = parseInt(current.ele);
    const nextEle = parseInt(next.ele);

    const diff = nextEle - currentEle;
    if (diff > 0) stats.elevationUp += diff;
    else stats.elevationDown += diff * -1;
  }

  const start = points[0]!.time;
  const end = points[points.length - 1]!.time;
  return {
    start,
    end,
    name: gpx.trk[0]!.name,
    ...stats,
  };
};

const calculateDistance = (
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
