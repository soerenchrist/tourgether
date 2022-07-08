import { trpc } from "@/utils/trpc";
import { Card } from "flowbite-react";
import CardTitle from "../common/cardTitle";

const TotalsDisplay = () => {
  const { data } = trpc.useQuery(["tours.get-totals"]);

  const format = (value: number | null | undefined) => {
    if (!value) return "0 m";
    if (value < 1000) return `${value} m`;
    const rounded = Math.round((value / 1000) * 100) / 100;
    return `${rounded} km`;
  };
  return (
    <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-2">
      <Card>
        <CardTitle title={(data?.count || 0) + ""} />
        Number of tours
      </Card>
      <Card>
        <CardTitle title={format(data?.elevationUp)} />
        Elevation Up
      </Card>
      <Card>
        <CardTitle title={format(data?.elevationDown)} />
        Elevation Down
      </Card>
      <Card>
        <CardTitle title={format(data?.distance)} />
        Distance
      </Card>
    </div>
  );
};

export default TotalsDisplay;
