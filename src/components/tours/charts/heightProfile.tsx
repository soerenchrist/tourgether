import { Point } from "@/server/router/tours";
import GenericProfileChart from "./genericProfileChart";

const HeightProfile: React.FC<{
  points: Point[];
  onHover: (point?: Point) => void;
}> = ({ points, onHover }) => {

  return (<GenericProfileChart
    color="#66bb6a"
    label="Elevation"
    onHover={onHover}
    points={points}
    primarySelector={(point) => point.time ?? new Date()}
    secondarySelector={(point) => point.elevation}
    primaryTooltipFormatter={(value) => value?.toLocaleTimeString() ?? ""}
    secondaryTooltipFormatter={(value) => `${Math.round(value ?? 0)} m`}
    useAdaptiveMin={true} />);
};

export default HeightProfile;
