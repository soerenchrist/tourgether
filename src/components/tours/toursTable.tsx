import { useIsMobile } from "@/hooks/useIsMobile";
import { type Tour } from "@prisma/client";
import { Table } from "flowbite-react";
import Link from "next/link";
import { useRouter } from "next/router";
import Skeleton from "../common/skeleton";
import SortableCol, { type SortState } from "../common/sortableCol";

const TourRowLoader = () => {
  return (
    <Table.Row>
      <Table.Cell>
        <Skeleton className="h-4 w-32" />
      </Table.Cell>
      <Table.Cell>
        <Skeleton className="h-4 w-20" />
      </Table.Cell>
      <Table.Cell className="hidden md:table-cell">
        <Skeleton className="h-4 w-20" />
      </Table.Cell>
      <Table.Cell className="hidden md:table-cell">
        <Skeleton className="h-4 w-12" />
      </Table.Cell>
      <Table.Cell></Table.Cell>
    </Table.Row>
  );
};

const ToursTable: React.FC<{
  tours: Tour[] | undefined;
  isLoading: boolean;
  noResultsText?: string;
  sortState: SortState<Tour>;
  onChangeSortState: (state: SortState<Tour>) => void;
}> = ({ tours, isLoading, noResultsText, sortState, onChangeSortState }) => {
  const format = (value: number | null | undefined) => {
    if (!value) return "0 m";
    if (value < 10000) return `${value} m`;
    const rounded = Math.round((value / 1000) * 100) / 100;
    return `${rounded} km`;
  };
  const router = useRouter();
  const isMobile = useIsMobile();
  const tableHeader = (
    <Table.Head>
      <Table.HeadCell className="lg:w-1/3 sm:w-2/3">
        <SortableCol
          sortKey="name"
          sortState={sortState}
          onSort={onChangeSortState}
        >
          Name
        </SortableCol>
      </Table.HeadCell>
      <Table.HeadCell>
        <SortableCol
          sortKey="date"
          sortState={sortState}
          onSort={onChangeSortState}
        >
          Date
        </SortableCol>
      </Table.HeadCell>
      <Table.HeadCell className="hidden md:table-cell">
        <SortableCol
          sortKey="distance"
          sortState={sortState}
          onSort={onChangeSortState}
        >
          Distance
        </SortableCol>
      </Table.HeadCell>
      <Table.HeadCell className="hidden md:table-cell">
        <SortableCol
          sortKey="elevationUp"
          sortState={sortState}
          onSort={onChangeSortState}
        >
          Ascent
        </SortableCol>
      </Table.HeadCell>
      <Table.HeadCell className="hidden md:table-cell"></Table.HeadCell>
    </Table.Head>
  );
  const noDataContent = (
    <Table.Row>
      <Table.Cell>{noResultsText || "You dont have any tours yet"}</Table.Cell>
      <Table.Cell></Table.Cell>
      <Table.Cell className="hidden md:table-cell"></Table.Cell>
      <Table.Cell className="hidden md:table-cell"></Table.Cell>
      <Table.Cell className="hidden md:table-cell"></Table.Cell>
    </Table.Row>
  );
  const handleRowClick = (id: string) => {
    if (isMobile) {
      router.push(`/tours/${id}`)
    }
  }

  return (
    <Table className="rounded-b-none shadow-none" style={{ zIndex: 1 }} hoverable={isMobile}>
      {tableHeader}
      <Table.Body>
        {isLoading && <TourRowLoader />}
        {tours?.length === 0 && !isLoading && noDataContent}
        {tours?.map((tour) => (
          <Table.Row key={tour.id} onClick={() => handleRowClick(tour.id)}>
            <Table.Cell>{tour.name}</Table.Cell>
            <Table.Cell>{tour.date.toLocaleDateString()}</Table.Cell>
            <Table.Cell className="hidden md:table-cell">
              {format(tour.distance)}
            </Table.Cell>
            <Table.Cell className="hidden md:table-cell">
              {format(tour.elevationUp)}
            </Table.Cell>
            <Table.Cell className="md:flex justify-end items-center h-full hidden">
              <Link href={`/tours/${tour.id}`}>
                <span className="font-medium text-blue-500 cursor-pointer dark:text-blue-500 hover:underline">
                  Show
                </span>
              </Link>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default ToursTable;
