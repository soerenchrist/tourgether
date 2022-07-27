import { Point } from "@/server/router/tours";
import GenericProfileChart from "./genericProfileChart";


const HeartRateProfile: React.FC<{
  points: Point[];
  mode: "distance" | "time"
  onHover: (point?: Point) => void;
}> = ({ points, onHover, mode }) => {
  return (<GenericProfileChart
    color="#e53935"
    label="Heart rates"
    onHover={onHover}
    points={points}
    mode={mode}
    secondarySelector={(point) => point.heartRate ?? 0}
    secondaryTooltipFormatter={(value) => `${value ?? 0} bpm`}
    useAdaptiveMin={false} />);
};

export default HeartRateProfile;
