import CardTitle from "@/components/common/cardTitle";
import Input from "@/components/common/input";
import PaginationText from "@/components/common/paginationText";
import LayoutBase from "@/components/layout/layoutBase";
import PeaksList from "@/components/peaks/peaksList";
import { trpc } from "@/utils/trpc";
import { MapIcon, ViewListIcon } from "@heroicons/react/solid";
import { Button, Card, Pagination, Spinner } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useState } from "react";

const Map = dynamic(() => import("../../components/maps/peakSearchMap"), {
  ssr: false,
});

const PeaksPageContent: React.FC = () => {
  const [mapMode, setMapMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const count = 10;
  const { data, isLoading } = trpc.useQuery([
    "peaks.get-peaks",
    {
      pagination: {
        page,
        count,
      },
      searchTerm: searchTerm,
    },
  ]);
  const totalPages = Math.ceil((data?.totalCount ?? 1) / count);
  const router = useRouter();

  if (mapMode) {
    return (
      <Card>
        <div className="flex justify-between">
          <CardTitle title="Peaks" />

          <ViewListIcon
            className="h-5 w-5 text-gray-500 cursor-pointer"
            onClick={() => setMapMode(false)}
          />
        </div>

        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          id="searchPeaks"
        />
        <div className="h-96">
          <Map searchTerm={searchTerm} />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex justify-between">
        <CardTitle title="Peaks" />

        <MapIcon
          className="h-5 w-5 text-gray-500 cursor-pointer"
          onClick={() => setMapMode(true)}
        />
      </div>
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
        id="searchPeaks"
      />
      <PeaksList peaks={data?.peaks} isLoading={isLoading} />
      <div className="flex justify-between p-2 items-center">
        <div>
          <PaginationText
            from={page * count}
            to={page * count + (data?.peaks.length ?? 0)}
            total={data?.totalCount ?? 0}
          />
          <Pagination
            layout="pagination"
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>

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
