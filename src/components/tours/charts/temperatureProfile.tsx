import { Point } from "@/server/router/tours";
import GenericProfileChart from "./genericProfileChart";

const TemperatureProfile: React.FC<{
  points: Point[];
  onHover: (point?: Point) => void;
}> = ({ points, onHover }) => {
  
  return (<GenericProfileChart
    color="#795548"
    label="Temperature"
    onHover={onHover}
    points={points}
    primarySelector={(point) => point.time ?? new Date()}
    secondarySelector={(point) => point.temperature ?? 0}
    primaryTooltipFormatter={(value) => value?.toLocaleTimeString() ?? ""}
    secondaryTooltipFormatter={(value) => `${value ?? 0} °C`}
    useAdaptiveMin={false} />);
};

export default TemperatureProfile;
