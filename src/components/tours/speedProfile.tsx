import { calculateDistance } from "@/lib/gpxLib";
import { Point } from "@prisma/client";
import { Card } from "flowbite-react";
import { useCallback, useMemo } from "react";
import { AxisOptions, Chart } from "react-charts";
import CardTitle from "../common/cardTitle";

const filter = <T,>(points: T[], factor: number) => {
  const results: T[] = [];
  points.forEach((p, index) => {
    if (index % factor === 0) results.push(p);
  });
  return results;
};

type Speed = {
  point: Point;
  speed: number;
};

const calculateSpeeds = (points: Point[]) => {
  const speeds: Speed[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]!;
    const next = points[i + 1]!;
    const distance = calculateDistance(
      current.latitude,
      current.longitude,
      next.latitude,
      next.longitude
    );

    const timeDiff = next.time.getTime() - current.time.getTime() / 1000;
    speeds.push({
      speed: distance / timeDiff,
      point: current,
    });
  }

  return speeds;
};

const SpeedProfile: React.FC<{
  points: Point[];
  onHover: (point?: Point) => void;
}> = ({ points, onHover }) => {
  const data = useMemo(
    () => [
      {
        label: "Speed",
        data: calculateSpeeds(filter(points, 10)),
      },
    ],
    [points]
  );

  const primaryAxis = useMemo(
    (): AxisOptions<Speed> => ({
      getValue: (datum) => datum.point.time,
      formatters: {
        tooltip: (value?: Date) => value?.toLocaleTimeString(),
      },
    }),
    []
  );

  const secondaryAxes = useMemo(
    (): AxisOptions<Speed>[] => [
      {
        getValue: (datum) => datum.speed,
        formatters: {
          scale: (value?: number) =>
            `${Math.round((value ?? 0) * 100) / 100} m/s`,
          tooltip: (value?: number) =>
            `${Math.round((value ?? 0) * 100) / 100} m/s`,
        },
        elementType: "area",
      },
    ],
    []
  );

  const getSeriesStyle = useCallback(() => {
    const color = "#e53935"
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
          onFocusDatum: (e) => onHover(e?.originalDatum.point),
        }}
      />
    </div>
  );
};

export default SpeedProfile;
