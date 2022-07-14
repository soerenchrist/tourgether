import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useEffect, useMemo } from "react";
import "leaflet-defaulticon-compatibility";
import { calculateBounds } from "@/utils/gpxHelpers";
import { Peak, Point } from "@prisma/client";

const PositionHandler: React.FC<{
  peaks?: Peak[];
  points?: Point[];
}> = ({ peaks, points }) => {
  const map = useMap();

  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = calculateBounds(
        points.map((p) => ({ lat: p.latitude, lng: p.longitude }))
      );
      map.flyToBounds(bounds, { padding: [10, 10], duration: 1 });
      return;
    }

    if ((peaks?.length || 0) > 0) {
      const bounds = calculateBounds(
        peaks!.map((p) => ({ lat: p.latitude, lng: p.longitude }))
      );
      map.flyToBounds(bounds, { maxZoom: 12, duration: 1 });
    }
  }, [map, peaks, points]);

  return <></>;
};

const TrackLine: React.FC<{ points: Point[] }> = ({ points }) => {
  const poly = useMemo(
    () => points.map((p) => ({ lat: p.latitude, lng: p.longitude })),
    [points]
  );

  return <Polyline positions={poly} />;
};

const TourMap: React.FC<{ peaks?: Peak[]; points?: Point[]; hoverPoint?: Point }> = ({
  peaks,
  points,
  hoverPoint
}) => {
  return (
    <MapContainer
      className="h-full"
      center={[47, 11]}
      zoom={13}
      style={{ zIndex: 0 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <PositionHandler peaks={peaks} points={points} />
      {peaks?.map((peak) => (
        <Marker key={peak.id} position={[peak.latitude, peak.longitude]}>
          <Tooltip permanent>{peak.name}</Tooltip>
        </Marker>
      ))}
      {points && <TrackLine points={points} />}
      {hoverPoint && <Marker position={[hoverPoint.latitude, hoverPoint.longitude]}>
        <Tooltip permanent>
          <b>{hoverPoint.time.toLocaleTimeString()}</b> ({Math.round(hoverPoint.elevation)} m)
        </Tooltip>
      </Marker>}
    </MapContainer>
  );
};

export default TourMap;
