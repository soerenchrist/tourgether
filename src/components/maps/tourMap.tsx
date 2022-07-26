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
import { Peak } from "@prisma/client";
import { attribution, layerUrl } from "@/utils/mapConstants";
import { blueMarker, greenMarker, redMarker } from "./icons";
import { Point } from "@/server/router/tours";

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
  }, [peaks, points, map]);

  return <></>;
};

const TrackLine: React.FC<{ points: Point[] }> = ({ points }) => {
  const poly = useMemo(
    () => points.map((p) => ({ lat: p.latitude, lng: p.longitude })),
    [points]
  );

  return <Polyline positions={poly} />;
};

const TourMap: React.FC<{
  peaks?: Peak[];
  points?: Point[];
  hoverPoint?: Point;
  allowScrolling?: boolean;
  allowDragging?: boolean;
  showZoomControl?: boolean;
}> = ({
  peaks,
  points,
  hoverPoint,
  allowScrolling,
  allowDragging,
  showZoomControl,
}) => {
  const startPosition = useMemo(() => points?.at(0), [points]);
  const endPosition = useMemo(() => points?.at(-1), [points]);

  return (
    <MapContainer
      className="h-full"
      center={[47, 11]}
      zoom={13}
      style={{ zIndex: 0 }}
      dragging={allowDragging == null ? true : allowDragging}
      scrollWheelZoom={allowScrolling == null ? true : allowScrolling}
      zoomControl={showZoomControl == null ? true : showZoomControl}
    >
      <TileLayer attribution={attribution} url={layerUrl} />

      <PositionHandler peaks={peaks} points={points} />
      {peaks?.map((peak) => (
        <Marker
          key={peak.id}
          icon={blueMarker}
          position={[peak.latitude, peak.longitude]}
        >
          <Tooltip permanent>
            {peak.name} ({peak.height} m)
          </Tooltip>
        </Marker>
      ))}
      {points && <TrackLine points={points} />}
      {hoverPoint && (
        <Marker
          position={[hoverPoint.latitude, hoverPoint.longitude]}
          icon={blueMarker}
        >
          {hoverPoint.time && (
            <Tooltip permanent>
              <b>{hoverPoint.time.toLocaleTimeString()}</b> (
              {Math.round(hoverPoint.elevation)} m)
            </Tooltip>
          )}
        </Marker>
      )}

      {startPosition && (
        <Marker
          position={[startPosition.latitude, startPosition.longitude]}
          icon={greenMarker}
        >
          {startPosition.time && (
            <Tooltip>
              <b>{startPosition.time.toLocaleTimeString()}</b> (
              {Math.round(startPosition.elevation)} m)
            </Tooltip>
          )}
        </Marker>
      )}
      {endPosition && (
        <Marker
          position={[endPosition.latitude, endPosition.longitude]}
          icon={redMarker}
        >
          {endPosition.time && (
            <Tooltip>
              <b>{endPosition.time.toLocaleTimeString()}</b> (
              {Math.round(endPosition.elevation)} m)
            </Tooltip>
          )}
        </Marker>
      )}
    </MapContainer>
  );
};

export default TourMap;
