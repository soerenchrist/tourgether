import { Point } from "@prisma/client";
import { useCallback, useMemo } from "react";
import { AxisOptions, Chart } from "react-charts";

const filter = <T,>(points: T[], factor: number) => {
  const results: T[] = [];
  points.forEach((p, index) => {
    if (index % factor === 0) results.push(p);
  });
  return results;
};

const TemperatureProfile: React.FC<{
  points: Point[];
  onHover: (point?: Point) => void;
}> = ({ points, onHover }) => {
  const data = useMemo(
    () => [
      {
        label: "Temperature",
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
        getValue: (datum) => datum.temperature ?? 0,
        formatters: {
          scale: (value?: number) => `${value ?? 0} °C`,
          tooltip: (value?: number) => `${value ?? 0} °C`,
        },
        elementType: "area",
      },
    ],
    []
  );

  const getSeriesStyle = useCallback(() => {
    const color = "#795548"
    return { fill: color, stroke: color };
  }, [])

  return (
    <div className="h-56 p-4">
      <Chart
        options={{
          primaryAxis,
          secondaryAxes,
          data,
          getSeriesStyle,
          onFocusDatum: (e) => onHover(e?.originalDatum),
        }}
      />
    </div>
  );
};

export default TemperatureProfile;
