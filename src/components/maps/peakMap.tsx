import { Peak } from "@prisma/client";
import { LatLngExpression } from "leaflet";
import "leaflet-defaulticon-compatibility";
import { useMemo } from "react";
import { Circle, MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";

const PeakMap: React.FC<{ peak: Peak, dominance?: number | null }> = ({ peak, dominance }) => {

  const position: LatLngExpression = useMemo(() => [peak.latitude, peak.longitude], [peak]);
  return (
    <MapContainer
      className="h-96 z-0"
      center={position}
      zoom={10}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://a.tile.opentopomap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position}>
        <Tooltip>
          <span className="text-xl">{peak.name}</span>
        </Tooltip>
      </Marker>
      {dominance && <Circle center={position} radius={dominance*1000} color="#e53935" fillOpacity={0.1}>
        <Tooltip>Dominance: {dominance} km</Tooltip></Circle>}
    </MapContainer>
  );
};

export default PeakMap;
