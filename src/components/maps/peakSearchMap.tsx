import { trpc } from "@/utils/trpc";
import { LatLngBounds } from "leaflet";
import "leaflet-defaulticon-compatibility";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Tooltip,
  useMapEvents,
} from "react-leaflet";

type Bounds = {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
};

const MapEventHandler: React.FC<{
  onBoundsChanged: (bounds: Bounds) => void;
}> = ({ onBoundsChanged }) => {
  const raiseBoundsChanged = (bounds: LatLngBounds) => {
    onBoundsChanged({
      minLat: bounds.getSouthWest().lat,
      minLng: bounds.getSouthWest().lng,
      maxLat: bounds.getNorthEast().lat,
      maxLng: bounds.getNorthEast().lng,
    });
  };

  const map = useMapEvents({
    moveend: () => {
      const bounds = map.getBounds();
      raiseBoundsChanged(bounds);
    },
  });

  useEffect(() => {
    const bounds = map.getBounds();
    raiseBoundsChanged(bounds);
  }, []);

  return <></>;
};

const PeakSearchMap: React.FC<{ searchTerm: string; onlyClimbed: boolean }> = ({
  searchTerm,
  onlyClimbed,
}) => {
  const [bounds, setBounds] = useState<Bounds>();
  const { data } = trpc.useQuery([
    "peaks.get-peaks",
    {
      pagination: {
        count: 50,
        page: 1,
      },
      searchTerm,
      bounds,
      onlyClimbed,
    },
  ]);

  const markerEvents = useMemo(
    () => ({
      click(marker: any) {
        console.log(marker);
      },
    }),
    []
  );

  const handleBoundsChanged = (bounds: Bounds) => {
    setBounds(bounds);
  };

  return (
    <MapContainer
      className="h-full"
      center={{ lat: 47, lng: 11 }}
      zoom={13}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapEventHandler onBoundsChanged={handleBoundsChanged} />
      {data?.peaks.map((p) => (
        <Marker
          key={p.id}
          eventHandlers={markerEvents}
          position={[p.latitude, p.longitude]}
        >
          <Tooltip>
            {p.name} ({p.height} m)
          </Tooltip>
          <Popup>
            <h2 className="text-xl">{p.name}</h2>
            <Link href={`/peaks/${p.id}`}>
              <span className="text-blue-500 hover:underline font-medium cursor-pointer">
                Show details
              </span>
            </Link>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default PeakSearchMap;
