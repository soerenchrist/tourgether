import useDebounceValue from "@/hooks/useDebounce";
import { trpc } from "@/utils/trpc";
import { type Tour } from "@prisma/client";
import { Card, Pagination } from "flowbite-react";
import { useEffect, useState } from "react";
import CardTitle from "../common/cardTitle";
import Input from "../common/input";
import PaginationText from "../common/paginationText";
import { type SortState } from "../common/sortableCol";
import ToursTable from "../tours/toursTable";

const UsersTours: React.FC<{ userId: string; name: string }> = ({
  userId,
  name,
}) => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortState, setSortState] = useState<SortState<Tour>>({
    order: "desc",
    sortKey: "date",
  });
  const debouncedSearchTerm = useDebounceValue(searchTerm, 500);
  const count = 20;
  const { data, isLoading } = trpc.useQuery([
    "tours.get-tours",
    {
      userId,
      page: page,
      count,
      orderBy: sortState.sortKey,
      orderDir: sortState.order,
      searchTerm: debouncedSearchTerm,
    },
  ]);
  const totalPages = Math.ceil((data?.totalCount ?? 1) / count);
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm, sortState]);
  return (
    <Card>
      <div className="flex flex-col h-full justify-start gap-2">
        <CardTitle title="Tours" />
        <Input
          value={searchTerm}
          autoComplete="off"
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          id="searchTours"
        />
        <ToursTable
          tours={data?.tours}
          isLoading={isLoading}
          sortState={sortState}
          onChangeSortState={setSortState}
          noResultsText={
            searchTerm.length === 0
              ? `${name} does not have any visible tours yet`
              : `No tours found for search term: "${searchTerm}"`
          }
        />
        <div>
          <PaginationText
            from={(page - 1) * count}
            to={(page - 1) * count + (data?.tours.length ?? 0)}
            total={data?.totalCount ?? 0}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      </div>
    </Card>
  );
};

export default UsersTours;
