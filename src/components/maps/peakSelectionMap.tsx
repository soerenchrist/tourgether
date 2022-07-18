import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet-defaulticon-compatibility";
import { useEffect } from "react";
import { attribution, layerUrl } from "@/utils/mapConstants";

type Coordinate = {
  lat: number;
  lng: number;
};

const MapEventHandler: React.FC<{
  onClick: (coord: Coordinate) => void;
  latitude: number;
  longitude: number;
}> = ({ onClick, latitude, longitude }) => {
  const map = useMapEvents({
    click: (event) => {
      onClick(event.latlng);
    },
  });

  useEffect(() => {
    map.setView([latitude, longitude], map.getZoom(), {
      duration: 1
    });
  }, [latitude, longitude, map]);

  return <></>;
};

const PeakSelectionMap: React.FC<{
  latitude: number;
  longitude: number;
  onCoordinateChange: (coord: Coordinate) => void;
}> = ({ latitude, longitude, onCoordinateChange }) => {
  return (
    <MapContainer
      className="h-full"
      center={{ lat: latitude, lng: longitude }}
      zoom={13}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution={attribution}
        url={layerUrl}
      />
      <Marker position={{ lat: latitude, lng: longitude }} />
      <MapEventHandler
        onClick={onCoordinateChange}
        latitude={latitude}
        longitude={longitude}
      />
    </MapContainer>
  );
};

export default PeakSelectionMap;
