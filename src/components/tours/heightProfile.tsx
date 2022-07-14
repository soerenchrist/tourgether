import { Point } from "@prisma/client";
import { Card } from "flowbite-react";
import { useMemo } from "react";
import { AxisOptions, Chart } from "react-charts";
import CardTitle from "../common/cardTitle";

type HeightValue = {
  date: Date;
  value: number;
};

const filter = <T,>(points: T[], factor: number) => {
  const results: T[] = [];
  points.forEach((p, index) => {
    if (index % factor === 0) results.push(p);
  });
  return results;
};

const HeightProfile: React.FC<{ points: Point[] }> = ({ points }) => {
  const data = useMemo(
    () => [
      {
        label: "Elevation",
        data: filter(
          points.map((p) => ({ date: p.time, value: p.elevation })),
          10
        ),
      },
    ],
    [points]
  );

  const primaryAxis = useMemo(
    (): AxisOptions<HeightValue> => ({
      getValue: (datum) => datum.date,
      formatters: {
        tooltip: (value?: Date) => value?.toLocaleTimeString(),
      },
    }),
    []
  );

  const secondaryAxes = useMemo(
    (): AxisOptions<HeightValue>[] => [
      {
        getValue: (datum) => datum.value,
        formatters: {
          scale: (value?: number) => `${Math.round(value ?? 0)} m`,
          tooltip: (value?: number) => `${Math.round(value ?? 0)} m`,
        },
      },
    ],
    []
  );

  return (
    <Card>
      <div className="flex flex-col">
        <CardTitle title="Height profile"></CardTitle>
        <div className="h-96 p-4">
          <Chart
            options={{
              primaryAxis,
              secondaryAxes,
              data,
            }}
          />
        </div>
      </div>
    </Card>
  );
};

export default HeightProfile;
