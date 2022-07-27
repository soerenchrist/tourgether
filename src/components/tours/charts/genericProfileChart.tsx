import { calculateDistance } from "@/lib/gpxLib";
import { type Point } from "@/server/router/tours";
import { useCallback, useMemo } from "react";
import { AxisOptions, Chart } from "react-charts";

type DistancePoint = Point & { distance: number };

type Props = {
  points: Point[];
  onHover: (point?: Point) => void;
  label: string;
  mode: "distance" | "time";
  secondarySelector: (point: Point) => number;
  color: string;
  secondaryTooltipFormatter?: (value?: number) => string;
  useAdaptiveMin?: boolean;
};

const findMin = (points: Point[]) => {
  let min = 10000;
  points.forEach((x) => {
    if (x.elevation < min) min = x.elevation;
  });
  return min;
};

const calcDistances = (points: Point[]) => {
  let currentDistance = 0.0;
  const results: DistancePoint[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i]!;
    const next = points[i + 1]!;

    const distance = calculateDistance(
      current.latitude,
      current.longitude,
      next.latitude,
      next.longitude
    );
    currentDistance += distance;

    results.push({
      ...current,
      distance: currentDistance,
    });
  }
  return results;
};

const filter = <T,>(points: T[], factor: number) => {
  const results: T[] = [];
  points.forEach((p, index) => {
    if (index % factor === 0) results.push(p);
  });
  return results;
};

const getFactor = (totalCount: number) => {
  if (totalCount < 100) return 1;
  if (totalCount < 600) return 3;
  if (totalCount < 1000) return 5;
  return 10;
};

const distanceSelector = (datum: DistancePoint) => datum.distance;
const dateSelector = (datum: DistancePoint) => datum.time;
const dateFormatter = (value?: Date) => value?.toLocaleTimeString() ?? "";
const distanceFormatter = (value?: number) => `${Math.round(value ?? 0)} m`;

const GenericProfileChart: React.FC<Props> = ({
  points,
  onHover,
  label,
  color,
  mode,
  secondarySelector,
  secondaryTooltipFormatter,
  useAdaptiveMin,
}) => {
  const distancePoints = useMemo(() => calcDistances(points), [points]);
  const filteredPoints = useMemo(
    () => filter(distancePoints, getFactor(distancePoints.length)),
    [distancePoints]
  );
  const data = useMemo(
    () => [
      {
        label: label,
        data: filteredPoints,
      },
    ],
    [filteredPoints, label]
  );

  const selector = useMemo(
    () => (mode === "distance" ? distanceSelector : dateSelector),
    [mode]
  );
  const formatter = useMemo(
    () => (mode === "distance" ? distanceFormatter : dateFormatter),
    [mode]
  );

  const primaryAxis = useMemo(
    (): AxisOptions<DistancePoint> => ({
      getValue: selector,
      formatters: {
        tooltip: formatter as any,
      },
    }),
    [selector, formatter]
  );

  const min = useMemo(
    () => (useAdaptiveMin ? findMin(points) : 0),
    [points, useAdaptiveMin]
  );

  const getSeriesStyle = useCallback(() => {
    return { fill: color, stroke: color };
  }, [color]);

  const secondaryAxes = useMemo(
    (): AxisOptions<DistancePoint>[] => [
      {
        getValue: secondarySelector,
        formatters: {
          scale: secondaryTooltipFormatter,
          tooltip: secondaryTooltipFormatter,
        },
        elementType: "area",
        hardMin: useAdaptiveMin ? min : undefined,
      },
    ],
    [min, useAdaptiveMin, secondarySelector, secondaryTooltipFormatter]
  );

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

export default GenericProfileChart;
