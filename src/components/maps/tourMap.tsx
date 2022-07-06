import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { trpc } from "@/utils/trpc";
import { useMemo, useState } from "react";
import gpxParser from "gpx-parser-builder";
import { latLngBounds, LatLngExpression } from "leaflet";

type Props = {
  tracks?: {
    id: string;
    color: string;
  }[];
};

const calculateBounds = (path: { lat: number; lng: number }[]) => {
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

  return latLngBounds(
    { lat: minLat, lng: minLng },
    { lat: maxLat, lng: maxLng }
  );
};

const TrackLine: React.FC<{
  track: { id: string; color: string };
  flyTo: boolean;
}> = ({ track, flyTo }) => {
  const { data, isLoading } = trpc.useQuery([
    "tours.get-track-content",
    { id: track.id },
  ]);
  const [points, setPoints] = useState<LatLngExpression[]>([]);
  const map = useMap();

  useMemo(() => {
    if (data) {
      const gpx = gpxParser.parse(data);
      const waypoints = gpx.trk.flatMap((t) =>
        t.trkseg.flatMap((s) => s.trkpt)
      );
      const latLngs: { lat: number; lng: number }[] = waypoints.map((w) => ({
        lat: parseFloat(w.$.lat),
        lng: parseFloat(w.$.lon),
      }));
      setPoints(latLngs);
      if (flyTo) {
        const bounds = calculateBounds(latLngs);
        map.flyToBounds(bounds, { padding: [10, 10], duration: 1 });
      }
    }
  }, [data, map, flyTo]);

  if (isLoading) return <></>;
  return <Polyline positions={points} color={track.color} />;
};

const TourMap = (props: Props) => {
  return (
    <MapContainer
      className="h-full"
      center={[51.505, -0.09]}
      zoom={13}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {props.tracks?.map((track, index) => (
        <TrackLine key={track.id} track={track} flyTo={index === 0} />
      ))}
    </MapContainer>
  );
};

export default TourMap;
