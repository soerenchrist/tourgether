import CardTitle from "@/components/common/cardTitle";
import Input from "@/components/common/input";
import LayoutBase from "@/components/layout/layoutBase";
import PeaksList from "@/components/peaks/peaksList";
import { trpc } from "@/utils/trpc";
import { Card, Spinner } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useState } from "react";

const PeaksPageContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: peaks, isLoading } = trpc.useQuery([
    "peaks.get-peaks",
    {
      searchTerm: searchTerm,
    },
  ]);

  return (
    <Card>
      <CardTitle title="Peaks" />
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
        id="searchPeaks"
      />
      {peaks && <PeaksList peaks={peaks} isLoading={isLoading} />}
    </Card>
  );
};

const PeaksPage: NextPage = () => {
  const { status } = useSession();

  let content = <PeaksPageContent />;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <Spinner size="xl" />;

  return <LayoutBase>{content}</LayoutBase>;
};

export default PeaksPage;
