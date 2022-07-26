import HistoryChart from "@/components/stats/historyChart";
import LayoutBase from "@/components/layout/layoutBase";
import { NextPage } from "next";
import Head from "next/head";
import { TotalsContainer } from "@/components/stats/totalsDisplay";
import {
  PageProps,
  protectedServersideProps,
} from "@/server/common/protectedServersideProps";

const StatsPageContent = () => {
  return (
    <>
      <Head>
        <title>Dashboard</title>
      </Head>
      <div className="flex flex-col gap-4">
        <TotalsContainer />
        <HistoryChart />
      </div>
    </>
  );
};

const StatsPage: NextPage<PageProps> = ({ data }) => {
  return (
    <>
    <Head>
      <title>Stats</title>
    </Head>
    <LayoutBase session={data.session}>
      <StatsPageContent></StatsPageContent>
    </LayoutBase>
    </>
  );
};

export const getServerSideProps = protectedServersideProps;
export default StatsPage;
