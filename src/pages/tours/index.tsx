import { NextPage } from "next";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { Button, Card, Pagination } from "flowbite-react";
import CardTitle from "@/components/common/cardTitle";
import { useEffect, useState } from "react";
import ToursTable from "@/components/tours/toursTable";
import PaginationText from "@/components/common/paginationText";
import useDebounceValue from "@/hooks/useDebounce";
import Input from "@/components/common/input";
import { type SortState } from "@/components/common/sortableCol";
import { type Tour } from "@prisma/client";
import {
  PageProps,
  protectedServersideProps,
} from "@/server/common/protectedServersideProps";
import { useIsMobile } from "@/hooks/useIsMobile";
import Meta from "@/components/common/meta";

const PaginatedToursTable: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [sortState, setSortState] = useState<SortState<Tour>>({
    order: "desc",
    sortKey: "date",
  });
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounceValue(searchTerm, 500);
  const count = 10;
  const { data, isLoading } = trpc.useQuery([
    "tours.get-tours",
    {
      count,
      page: page,
      searchTerm: debouncedSearchTerm,
      orderBy: sortState.sortKey,
      orderDir: sortState.order,
    },
  ]);
  const totalPages = Math.ceil((data?.totalCount ?? 1) / count);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, sortState]);

  const handleAddClick = () => {
    router.push("/tours/create");
  };

  return (
    <Card>
      <CardTitle title="Your Tours" />
      <Input
        value={searchTerm}
        autoComplete="off"
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
        id="searchTours"
      />
      <ToursTable
        tours={data?.tours}
        sortState={sortState}
        onChangeSortState={setSortState}
        isLoading={isLoading}
        noResultsText={
          searchTerm.length === 0
            ? "You don't have any tours yet"
            : `No tours found for search term: "${searchTerm}"`
        }
      />

      <div className="flex justify-between p-2 items-center">
        <div>
          <PaginationText
            from={(page - 1) * count}
            to={(page - 1) * count + (data?.tours.length ?? 0)}
            total={data?.totalCount ?? 0}
          />
          <Pagination
            layout={isMobile ? "navigation" : "pagination"}
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>

        <div className="mt-2">
          <Button size="sm" onClick={handleAddClick}>
            {isMobile ? "Add" : "Add a new Tour"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

const ToursPage: NextPage<PageProps> = ({ data }) => {
  return (
    <>
      <Meta title="My Tours" />
      <LayoutBase session={data.session}>
        <PaginatedToursTable />
      </LayoutBase>
    </>
  );
};

export const getServerSideProps = protectedServersideProps;

export default ToursPage;
