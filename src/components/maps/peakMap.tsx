import { Peak } from "@prisma/client";
import { LatLngExpression } from "leaflet";
import "leaflet-defaulticon-compatibility";
import { useMemo } from "react";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";

const PeakMap: React.FC<{ peak: Peak }> = ({ peak }) => {

  const position: LatLngExpression = useMemo(() => [peak.latitude, peak.longitude], [peak]);
  return (
    <MapContainer
      className="h-96 z-0"
      center={position}
      zoom={12}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://a.tile.opentopomap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position}>
        <Tooltip permanent>
          <span className="text-xl">{peak.name}</span>
        </Tooltip>
      </Marker>
    </MapContainer>
  );
};

export default PeakMap;
