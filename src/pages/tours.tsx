import { NextPage } from "next";
import LayoutBase from "../components/layout/layoutBase";
import { trpc } from "../utils/trpc";

const Tours: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["tours.get-tours"]);

  if (isLoading || !data) return <div>Loading...</div>;

  return (
    <LayoutBase>
      <div className="flex flex-col h-screen justify-between container p-8">
        {data.length}
      </div>
    </LayoutBase>
  );
};

export default Tours;
