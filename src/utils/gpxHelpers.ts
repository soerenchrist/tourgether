import { LatLngBoundsExpression } from "leaflet";

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