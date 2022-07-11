import { Peak } from "@prisma/client";
import "leaflet-defaulticon-compatibility";
import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";

const PeakMap: React.FC<{ peak: Peak }> = ({ peak }) => {
  return (
    <MapContainer
      className="h-96 z-0"
      center={[peak.latitude, peak.longitude]}
      zoom={13}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[peak.latitude, peak.longitude]}>
        <Tooltip permanent>
          <span className="text-xl">{peak.name}</span>
        </Tooltip>
      </Marker>
    </MapContainer>
  );
};

export default PeakMap;
