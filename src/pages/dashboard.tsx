import FriendsTours from "@/components/dashboard/friendsTours";
import HistoryChart from "@/components/dashboard/historyChart";
import TotalsDisplay from "@/components/dashboard/totalsDisplay";
import LayoutBase from "@/components/layout/layoutBase";
import { Spinner } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";

const DashboardContent = () => {
  return (
    <div className="flex flex-col gap-4">
      <TotalsDisplay />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <HistoryChart className="lg:col-span-2"  />
        <FriendsTours />
      </div>
    </div>
  )
}

const Dashboard: NextPage = () => {
  const { status } = useSession();

  let content = <DashboardContent></DashboardContent>;
  if (status === "unauthenticated") content = <p>Access denied</p>
  else if (status === "loading") content = <Spinner size="xl"></Spinner>

  return <LayoutBase>{content}</LayoutBase>
};
export default Dashboard;
