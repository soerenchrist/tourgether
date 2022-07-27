import { trpc } from "@/utils/trpc";
import { Card, Spinner } from "flowbite-react";
import CardTitle from "../common/cardTitle";
import Skeleton from "../common/skeleton";

const TotalsDisplay: React.FC<{
  totals?: {
    count: number | null;
    elevationUp: number | null;
    elevationDown: number | null;
    distance: number | null;
  };
  peakCount?: number;
  isLoading: boolean;
}> = ({ totals, isLoading, peakCount }) => {
  const format = (value: number | null | undefined) => {
    if (!value) return "0 m";
    if (value < 1000) return `${value} m`;
    const rounded = Math.round((value / 1000) * 100) / 100;
    return `${rounded} km`;
  };
  return (
    <div className="grid md:grid-cols-5 sm:grid-cols-2 gap-2">
      <Card>
        {isLoading ? (
          <Skeleton className="w-20 h-7" />
        ) : (
          <CardTitle title={(totals?.count || 0) + ""} />
        )}
        Number of tours
      </Card>
      <Card>
        {isLoading ? (
          <Skeleton className="w-20 h-7" />
        ) : (
          <CardTitle title={(peakCount || 0) + ""} />
        )}
        Peaks reached
      </Card>
      <Card>
        {isLoading ? (
          <Skeleton className="w-20 h-7" />
        ) : (
          <CardTitle title={format(totals?.elevationUp)} />
        )}
        Total Ascent
      </Card>
      <Card>
        {isLoading ? (
          <Skeleton className="w-20 h-7" />
        ) : (
          <CardTitle title={format(totals?.elevationDown)} />
        )}
        Total Descent
      </Card>
      <Card>
        {isLoading ? (
          <Skeleton className="w-20 h-7" />
        ) : (
          <CardTitle title={format(totals?.distance)} />
        )}
        Distance
      </Card>
    </div>
  );
};

export const TotalsContainer: React.FC<{ userId?: string }> = ({ userId }) => {
  const { data: peakCount } = trpc.useQuery([
    "tours.count-peaks-reached",
    {
      userId,
    },
  ]);
  const { data, isLoading } = trpc.useQuery([
    "tours.get-totals",
    {
      userId,
    },
  ]);

  return (
    <TotalsDisplay totals={data} peakCount={peakCount} isLoading={isLoading} />
  );
};

export default TotalsDisplay;
