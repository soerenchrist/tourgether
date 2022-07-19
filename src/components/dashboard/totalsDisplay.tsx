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
  isLoading: boolean;
}> = ({ totals, isLoading }) => {
  const format = (value: number | null | undefined) => {
    if (!value) return "0 m";
    if (value < 1000) return `${value} m`;
    const rounded = Math.round((value / 1000) * 100) / 100;
    return `${rounded} km`;
  };
  return (
    <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-2">
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

export const TotalsContainer = () => {
  const { data, isLoading } = trpc.useQuery(["tours.get-totals"]);
  
  return <TotalsDisplay totals={data} isLoading={isLoading} />
}

export default TotalsDisplay;
