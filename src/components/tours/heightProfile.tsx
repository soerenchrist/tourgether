import { Point } from "@prisma/client";
import { Card } from "flowbite-react";
import { useMemo } from "react";
import { AxisOptions, Chart } from "react-charts";
import CardTitle from "../common/cardTitle";

const filter = <T,>(points: T[], factor: number) => {
  const results: T[] = [];
  points.forEach((p, index) => {
    if (index % factor === 0) results.push(p);
  });
  return results;
};

const HeightProfile: React.FC<{
  points: Point[];
  onHover: (point?: Point) => void;
}> = ({ points, onHover }) => {
  const data = useMemo(
    () => [
      {
        label: "Elevation",
        data: filter(points, 10),
      },
    ],
    [points]
  );

  const primaryAxis = useMemo(
    (): AxisOptions<Point> => ({
      getValue: (datum) => datum.time,
      formatters: {
        tooltip: (value?: Date) => value?.toLocaleTimeString(),
      },
    }),
    []
  );

  const secondaryAxes = useMemo(
    (): AxisOptions<Point>[] => [
      {
        getValue: (datum) => datum.elevation,
        formatters: {
          scale: (value?: number) => `${Math.round(value ?? 0)} m`,
          tooltip: (value?: number) => `${Math.round(value ?? 0)} m`,
        },
        elementType: "area",
      },
    ],
    []
  );

  return (
    <div className="h-56 p-4">
      <Chart
        options={{
          primaryAxis,
          secondaryAxes,
          data,
          onFocusDatum: (e) => onHover(e?.originalDatum),
        }}
      />
    </div>
  );
};

export default HeightProfile;
