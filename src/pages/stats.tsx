import HistoryChart from "@/components/stats/historyChart";
import LayoutBase from "@/components/layout/layoutBase";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { TotalsContainer } from "@/components/stats/totalsDisplay";


const DashboardContent = () => {
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

const Dashboard: NextPage = () => {
  const { status } = useSession();

  let content = <DashboardContent></DashboardContent>;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <></>;

  return <LayoutBase>{content}</LayoutBase>;
};
export default Dashboard;
