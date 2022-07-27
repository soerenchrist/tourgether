import HistoryChart from "@/components/stats/historyChart";
import LayoutBase from "@/components/layout/layoutBase";
import { NextPage } from "next";
import { TotalsContainer } from "@/components/stats/totalsDisplay";
import {
  PageProps,
  protectedServersideProps,
} from "@/server/common/protectedServersideProps";
import Meta from "@/components/common/meta";

const StatsPageContent = () => {
  return (
    <div className="flex flex-col gap-4">
      <TotalsContainer />
      <HistoryChart />
    </div>
  );
};

const StatsPage: NextPage<PageProps> = ({ data }) => {
  return (
    <>
    <Meta title="Stats"></Meta>
      <LayoutBase session={data.session}>
        <StatsPageContent></StatsPageContent>
      </LayoutBase>
    </>
  );
};

export const getServerSideProps = protectedServersideProps;
export default StatsPage;
