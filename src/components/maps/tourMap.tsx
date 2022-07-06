import { MapContainer, Polyline, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { trpc } from "@/utils/trpc";
import { useMemo, useState } from "react";
import { LatLngExpression } from "leaflet";
import { calculateBounds, getWaypoints } from "@/utils/gpxHelpers";

type Props = {
  tracks?: {
    id: string;
    color: string;
  }[];
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
      const latLngs = getWaypoints(data);
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
