import { calculateDistance } from "@/lib/gpxLib";
import { useCallback, useMemo } from "react";
import { AxisOptions, Chart } from "react-charts";

type HeightValue = {
  lat: number;
  lng: number;
  distance: number;
  elevation: number;
};

const format = (value: number | null | undefined) => {
  if (!value) return "0 m";
  if (value < 1000) return `${value} m`;
  const rounded = Math.round((value / 1000) * 100) / 100;
  return `${rounded} km`;
};

const parsePoints = (points: [number, number, number][]) => {
  let currentDistance = 0.0;
  const results: HeightValue[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [currentLng, currentLat] = points[i]!;
    const [nextLng, nextLat, nextEle] = points[i + 1]!;

    const distance = calculateDistance(
      currentLat,
      currentLng,
      nextLat,
      nextLng
    );
    currentDistance += distance;

    results.push({
      lat: nextLat,
      lng: nextLng,
      distance: currentDistance,
      elevation: nextEle,
    });
  }
  return results;
};
const findMin = (points: [number, number, number][]) => {
  let min = 10000;
  points.forEach((x) => {
    const elevation = x[2]!;
    if (elevation < min) min = elevation;
  });
  return min;
};

const HeightDistanceChart: React.FC<{
  points: [number, number, number][];
}> = ({ points }) => {
  const data = useMemo(
    () => [
      {
        label: "Elevation",
        data: parsePoints(points),
      },
    ],
    [points]
  );

  const primaryAxis = useMemo(
    (): AxisOptions<HeightValue> => ({
      getValue: (datum) => datum.distance,
      formatters: {
        tooltip: (value?: number) => format(value),
        scale: (value?: number) => format(value),
      },
    }),
    []
  );

  const min = useMemo(() => findMin(points), [points]);

  const secondaryAxes = useMemo(
    (): AxisOptions<HeightValue>[] => [
      {
        getValue: (datum) => datum.elevation,
        formatters: {
          scale: (value?: number) => `${Math.round(value ?? 0)} m`,
          tooltip: (value?: number) => `${Math.round(value ?? 0)} m`,
        },
        elementType: "area",
        hardMin: min,
      },
    ],
    [min]
  );

  const getSeriesStyle = useCallback(() => {
    const color = "#66bb6a";
    return { fill: color, stroke: color };
  }, []);

  return (
    <div className="h-56 p-4">
      <Chart
        options={{
          primaryAxis,
          secondaryAxes,
          data,
          getSeriesStyle,
        }}
      />
    </div>
  );
};

export default HeightDistanceChart;
