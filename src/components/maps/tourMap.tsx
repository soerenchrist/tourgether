import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { trpc } from "@/utils/trpc";
import { useEffect, useMemo, useState } from "react";
import { LatLngExpression } from "leaflet";
import "leaflet-defaulticon-compatibility";
import { calculateBounds, getWaypoints } from "@/utils/gpxHelpers";
import { Peak, Track } from "@prisma/client";
import { tracksRouter } from "@/server/router/tracks";

type Props = {
  tracks?: Track[];
  peaks?: Peak[];
};

const PositionHandler: React.FC<{
  tracks: Track[] | undefined;
  peaks: Peak[] | undefined;
}> = ({ tracks, peaks }) => {
  const map = useMap();

  useEffect(() => {
    if ((tracks?.length || 0) > 0) {
      return;
    }

    if ((peaks?.length || 0) > 0) {
      const bounds = calculateBounds(
        peaks!.map((p) => ({ lat: p.latitude, lng: p.longitude }))
      );
      map.flyToBounds(bounds, { padding: [10, 10], duration: 1 });
    }
  }, [tracks, map, peaks]);

  return <></>;
};

const TrackLine: React.FC<{
  track: Track;
  flyTo: boolean;
}> = ({ track, flyTo }) => {
  const { data, isLoading } = trpc.useQuery([
    "tracks.get-track-content",
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
        map.flyToBounds(bounds, { duration: 1, maxZoom: 10 });
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
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {props.tracks?.map((track, index) => (
        <TrackLine key={track.id} track={track} flyTo={index === 0} />
      ))}
      <PositionHandler peaks={props.peaks} tracks={props.tracks} />
      {props.peaks?.map((peak) => (
        <Marker key={peak.id} position={[peak.latitude, peak.longitude]}>
          <Tooltip permanent>{peak.name}</Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default TourMap;
