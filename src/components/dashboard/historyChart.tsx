import { trpc } from "@/utils/trpc";
import { Card } from "flowbite-react";
import { useMemo } from "react";
import { AxisOptions, Chart } from "react-charts";
import CardTitle from "../common/cardTitle";

type HistoryValue = {
  date: Date;
  value: number;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const HistoryChart: React.FC<{ className?: string }> = ({ className }) => {
  const { data } = trpc.useQuery(["tours.get-history", {}]);

  const primaryAxis = useMemo(
    (): AxisOptions<HistoryValue> => ({
      getValue: (datum) => datum.date,
      formatters: {
        tooltip: (value?: Date) => `${monthNames[value?.getMonth() ?? 0]} ${value?.getFullYear()}`,
      },
    }),
    []
  );

  const secondaryAxes = useMemo(
    (): AxisOptions<HistoryValue>[] => [
      {
        getValue: (datum) => datum.value,
        formatters: {
          scale: (value?: number) => `${value} m`,
          tooltip: (value?: number) => `${value} m`,
        }
      },
    ],
    []
  );
  return (
    <div className={className}>

      <Card>
        <div className="flex flex-col">
          <CardTitle title="History" />
          <div className="h-96 p-4">
            {data && (
              <Chart
                className="h-96"
                options={{
                  data,
                  primaryAxis,
                  secondaryAxes,
                }}
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HistoryChart;
