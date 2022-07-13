import {
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { useEffect } from "react";
import "leaflet-defaulticon-compatibility";
import { calculateBounds } from "@/utils/gpxHelpers";
import { Peak } from "@prisma/client";

type Props = {
  peaks?: Peak[];
};

const PositionHandler: React.FC<{
  peaks: Peak[] | undefined;
}> = ({ peaks }) => {
  const map = useMap();

  useEffect(() => {
    /*if ((tracks?.length || 0) > 0) {
      return;
    }*/

    if ((peaks?.length || 0) > 0) {
      const bounds = calculateBounds(
        peaks!.map((p) => ({ lat: p.latitude, lng: p.longitude }))
      );
      map.flyToBounds(bounds, { maxZoom: 12, duration: 1 });
    }
  }, [map, peaks]);

  return <></>;
};
/*
const TrackLine: React.FC<{
  flyTo: boolean;
}> = ({ flyTo }) => {
  const [points, setPoints] = useState<LatLngExpression[]>([]);
  const map = useMap();

  useMemo(() => {
    if (data) {
      const latLngs = getWaypoints(data);
      setPoints(latLngs);
      if (flyTo) {
        const bounds = calculateBounds(latLngs);
        map.flyToBounds(bounds, { duration: 1, padding: [10, 10] });
      }
    }
  }, [data, map, flyTo]);

  if (isLoading) return <></>;
  return <Polyline positions={points} color={track.color} />;
};
*/
const TourMap = (props: Props) => {
  return (
    <MapContainer
      className="h-full"
      center={[47, 11]}
      zoom={13}
      style={{zIndex: 0}}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <PositionHandler peaks={props.peaks} />
      {props.peaks?.map((peak) => (
        <Marker key={peak.id} position={[peak.latitude, peak.longitude]}>
          <Tooltip permanent>{peak.name}</Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default TourMap;
