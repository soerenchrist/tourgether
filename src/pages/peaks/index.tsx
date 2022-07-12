import CardTitle from "@/components/common/cardTitle";
import Input from "@/components/common/input";
import LayoutBase from "@/components/layout/layoutBase";
import PeaksList from "@/components/peaks/peaksList";
import { trpc } from "@/utils/trpc";
import { Button, Card, Pagination, Spinner } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react"
import { useRouter } from "next/router";
import { useState } from "react";

const PeaksPageContent: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const count = 20;
  const { data, isLoading } = trpc.useQuery([
    "peaks.get-peaks",
    {
      pagination: {
        page,
        count
      },
      searchTerm: searchTerm,
    },
  ]);
  const totalPages = Math.ceil((data?.totalCount ?? 1) / count);
  const router = useRouter();

  return (
    <Card>
      <CardTitle title="Peaks" />
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
        id="searchPeaks"
      />
      <PeaksList peaks={data?.peaks} isLoading={isLoading} />
      <div className="flex justify-between p-2 items-center">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)} />

        <div className="mt-2">
          <Button size="sm" onClick={() => router.push("/peaks/create")}>
            Add a new Peak
          </Button>
        </div>
      </div>
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
