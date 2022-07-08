import TotalsDisplay from "@/components/dashboard/totalsDisplay";
import LayoutBase from "@/components/layout/layoutBase";
import { NextPage } from "next";
import { useSession } from "next-auth/react";

const Dashboard: NextPage = () => {
  let content =  <TotalsDisplay />;
  
  return <LayoutBase>{content}</LayoutBase>
};
export default Dashboard;
