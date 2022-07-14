import { Point } from "@prisma/client";
import { Card, Dropdown } from "flowbite-react";
import { ReactNode, useMemo, useState } from "react";
import CardTitle from "../common/cardTitle";
import HeightProfile from "./heightProfile";
import SpeedProfile from "./speedProfile";

const ChartArea: React.FC<{
  points: Point[];
  onHover: (point?: Point) => void;
}> = ({ points, onHover }) => {
  const [currentChart, setCurrentChart] = useState<"height" | "speed">(
    "height"
  );

  let chart: ReactNode;
  switch (currentChart) {
    case "height":
      chart = chart = <HeightProfile points={points} onHover={onHover} />;
      break;
    case "speed":
      chart = chart = <SpeedProfile points={points} onHover={onHover} />;
      break;
    default:
      break;
  }

  const title = useMemo(
    () => (currentChart === "height" ? "Height profile" : "Speed profile"),
    [currentChart]
  );

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
        </Dropdown>
      </div>
      {chart}
    </Card>
  );
};

export default ChartArea;
