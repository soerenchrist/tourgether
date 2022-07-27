import { Point } from "@/server/router/tours";
import GenericProfileChart from "./genericProfileChart";

const HeightProfile: React.FC<{
  points: Point[];
  mode: "distance" | "time"
  onHover: (point?: Point) => void;
}> = ({ points, onHover, mode }) => {

  return (<GenericProfileChart
    color="#66bb6a"
    label="Elevation"
    onHover={onHover}
    mode={mode}
    points={points}
    secondarySelector={(point) => point.elevation}
    secondaryTooltipFormatter={(value) => `${Math.round(value ?? 0)} m`}
    useAdaptiveMin={true} />);
};

export default HeightProfile;
