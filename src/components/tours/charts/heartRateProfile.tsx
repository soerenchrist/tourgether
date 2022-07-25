import { Point } from "@/server/router/tours";
import GenericProfileChart from "./genericProfileChart";


const HeartRateProfile: React.FC<{
  points: Point[];
  onHover: (point?: Point) => void;
}> = ({ points, onHover }) => {
  return (<GenericProfileChart
    color="#e53935"
    label="Heart rates"
    onHover={onHover}
    points={points}
    primarySelector={(point) => point.time ?? new Date()}
    secondarySelector={(point) => point.heartRate ?? 0}
    primaryTooltipFormatter={(value) => value?.toLocaleTimeString() ?? ""}
    secondaryTooltipFormatter={(value) => `${value ?? 0} bpm`}
    useAdaptiveMin={false} />);
};

export default HeartRateProfile;
