import CardTitle from "@/components/common/cardTitle";
import LayoutBase from "@/components/layout/layoutBase";
import { Card, Spinner } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";

const PeaksPageContent : React.FC = () => {
  return (
    <Card>
      <CardTitle title="Peaks" />
    </Card>
  )
}

const PeaksPage: NextPage = () => {
  const { status } = useSession();

  let content = (
    <PeaksPageContent/>
  );
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <Spinner size="xl" />;

  return <LayoutBase>{content}</LayoutBase>;
};

export default PeaksPage;