import { Point } from "@prisma/client";
import { Card, Dropdown } from "flowbite-react";
import { ReactNode, useMemo, useState } from "react";
import CardTitle from "@/components/common/cardTitle";
import HeightProfile from "./heightProfile";
import SpeedProfile from "./speedProfile";
import HeartRateProfile from "./heartRateProfile";
import TemperatureProfile from "./temperatureProfile";
const ChartArea: React.FC<{
  points: Point[];
  onHover: (point?: Point) => void;
}> = ({ points, onHover }) => {
  const [currentChart, setCurrentChart] = useState<
    "height" | "speed" | "hr" | "temp"
  >("height");

  let chart: ReactNode;
  switch (currentChart) {
    case "height":
      chart = <HeightProfile points={points} onHover={onHover} />;
      break;
    case "speed":
      chart = <SpeedProfile points={points} onHover={onHover} />;
      break;
    case "hr":
      chart = <HeartRateProfile points={points} onHover={onHover} />;
      break;
    case "temp":
      chart = <TemperatureProfile points={points} onHover={onHover} />;
      break;
    default:
      break;
  }

  const hasHeartRates = useMemo(
    () => points[0]?.heartRate != null,
    [points]
  );

  const hasTemperature = useMemo(
    () => points[0]?.temperature != null, 
    [points]
  );

  const title = useMemo(() => {
    if (currentChart === "height") return "Height profile";
    else if (currentChart === "speed") return "Speed profile";
    else if (currentChart === "hr") return "Heart rates";
    else if (currentChart === "temp") return "Temperature";
    return "";
  }, [currentChart]);

  return (
    <Card>
      <div className="flex justify-between">
        <Dropdown inline label={<CardTitle title={title} />}>
          <Dropdown.Item onClick={() => setCurrentChart("height")}>
            Height profile
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setCurrentChart("speed")}>
            Speed profile
          </Dropdown.Item>
          {hasHeartRates && (
            <Dropdown.Item onClick={() => setCurrentChart("hr")}>
              Heart rates
            </Dropdown.Item>
          )}
          {hasTemperature && (
            <Dropdown.Item onClick={() => setCurrentChart("temp")}>
              Temperature
            </Dropdown.Item>
          )}
        </Dropdown>
      </div>
      {chart}
    </Card>
  );
};

export default ChartArea;
