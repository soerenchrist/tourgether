import { attribution, layerUrl } from "@/utils/mapConstants";
import { LatLng } from "leaflet";
import "leaflet-defaulticon-compatibility";
import { useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { greenMarker, redMarker } from "./icons";

const EventHandler: React.FC<{ onClick: (latlng: LatLng) => void }> = ({
  onClick,
}) => {
  const map = useMapEvents({
    click: (event) => {
      onClick(event.latlng);
    },
  });

  return <></>;
};

const PlanMap: React.FC<{
  onClick: (latlng: LatLng) => void;
  startPosition?: LatLng;
  endPosition?: LatLng;
  line: [number, number, number][];
}> = ({ onClick, line, startPosition, endPosition }) => {
  const linePositions = useMemo(
    () => line.map((x) => ({ lat: x[1], lng: x[0] })),
    [line]
  );
  return (
    <MapContainer
      className="h-full"
      center={[47, 11]}
      zoom={8}
      scrollWheelZoom={true}
    >
      <TileLayer attribution={attribution} url={layerUrl} />
      <EventHandler onClick={onClick} />
      <Polyline positions={linePositions}></Polyline>
      {startPosition && <Marker icon={greenMarker} position={startPosition}></Marker>}
      {endPosition && <Marker icon={redMarker} position={endPosition}></Marker>}
    </MapContainer>
  );
};

export default PlanMap;
