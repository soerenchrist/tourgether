import { type Point } from "@/server/router/tours";
import { useCallback, useMemo } from "react";
import { AxisOptions, Chart } from "react-charts";

type Props = {
  points: Point[];
  onHover: (point?: Point) => void;
  label: string;
  primarySelector: (point: Point) => Date;
  secondarySelector: (point: Point) => number;
  color: string;
  primaryTooltipFormatter?: (value?: Date) => string;
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

const GenericProfileChart: React.FC<Props> = ({
  points,
  onHover,
  label,
  color,
  primarySelector,
  secondarySelector,
  primaryTooltipFormatter,
  secondaryTooltipFormatter,
  useAdaptiveMin,
}) => {
  const filteredPoints = useMemo(
    () => filter(points, getFactor(points.length)),
    [points]
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

  const primaryAxis = useMemo(
    (): AxisOptions<Point> => ({
      getValue: primarySelector,
      formatters: {
        tooltip: primaryTooltipFormatter,
      },
    }),
    [primarySelector, primaryTooltipFormatter]
  );

  const min = useMemo(
    () => (useAdaptiveMin ? findMin(points) : 0),
    [points, useAdaptiveMin]
  );

  const getSeriesStyle = useCallback(() => {
    return { fill: color, stroke: color };
  }, [color]);

  const secondaryAxes = useMemo(
    (): AxisOptions<Point>[] => [
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
