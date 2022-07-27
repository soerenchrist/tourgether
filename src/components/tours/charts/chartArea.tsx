import { Card, Dropdown, Label, ToggleSwitch } from "flowbite-react";
import { ReactNode, useMemo, useState } from "react";
import CardTitle from "@/components/common/cardTitle";
import HeightProfile from "./heightProfile";
import SpeedProfile from "./speedProfile";
import HeartRateProfile from "./heartRateProfile";
import TemperatureProfile from "./temperatureProfile";
import { Point } from "@/server/router/tours";
const ChartArea: React.FC<{
  points: Point[];
  onHover: (point?: Point) => void;
}> = ({ points, onHover }) => {
  const [currentChart, setCurrentChart] = useState<
    "height" | "speed" | "hr" | "temp"
  >("height");
  const [mode, setMode] = useState<"distance" | "time">("distance");

  const chart = useMemo(() => {
    switch (currentChart) {
      case "height":
        return <HeightProfile points={points} mode={mode} onHover={onHover} />;
      case "speed":
        return <SpeedProfile points={points} onHover={onHover} />;
      case "hr":
        return (
          <HeartRateProfile points={points} mode={mode} onHover={onHover} />
        );
      case "temp":
        return (
          <TemperatureProfile points={points} mode={mode} onHover={onHover} />
        );
      default:
        return <></>;
    }
  }, [currentChart, points, onHover, mode]);

  const hasHeartRates = useMemo(() => points[0]?.heartRate != null, [points]);

  const hasTemperature = useMemo(
    () => points[0]?.temperature != null,
    [points]
  );

  const hasTime = useMemo(() => points[0]?.time !== undefined, [points]);

  const title = useMemo(() => {
    if (currentChart === "height") return "Height profile";
    else if (currentChart === "speed") return "Speed profile";
    else if (currentChart === "hr") return "Heart rates";
    else if (currentChart === "temp") return "Temperature";
    return "";
  }, [currentChart]);

  return (
    <Card>
      <div className="flex justify-between items-center">
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
        {hasTime && currentChart !== "speed" && (
          <div className="flex items-center">
            <div className="pr-4">
            <Label>By time</Label>
            </div>
            <ToggleSwitch
              checked={mode === "distance"}
              label=""
              onChange={(checked) =>
                checked ? setMode("distance") : setMode("time")
              }
            ></ToggleSwitch>
            <Label>By distance</Label>
          </div>
        )}
      </div>
      {chart}
    </Card>
  );
};

export default ChartArea;
