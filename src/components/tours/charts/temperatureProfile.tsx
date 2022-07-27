import { Point } from "@/server/router/tours";
import GenericProfileChart from "./genericProfileChart";

const TemperatureProfile: React.FC<{
  points: Point[];
  mode: "distance" | "time";
  onHover: (point?: Point) => void;
}> = ({ points, onHover, mode }) => {
  return (
    <GenericProfileChart
      color="#795548"
      label="Temperature"
      onHover={onHover}
      mode={mode}
      points={points}
      secondarySelector={(point) => point.temperature ?? 0}
      secondaryTooltipFormatter={(value) => `${value ?? 0} °C`}
      useAdaptiveMin={false}
    />
  );
};

export default TemperatureProfile;
