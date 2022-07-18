import { Tour } from "@prisma/client";
import { Table } from "flowbite-react";
import Link from "next/link";

const ToursTable: React.FC<{
  tours: Tour[] | undefined;
  isLoading: boolean;
  noResultsText?: string;
}> = ({ tours, isLoading, noResultsText }) => {
  const format = (value: number | null | undefined) => {
    if (!value) return "0 m";
    if (value < 10000) return `${value} m`;
    const rounded = Math.round((value / 1000) * 100) / 100;
    return `${rounded} km`;
  };
  const tableHeader = (
    <Table.Head>
      <Table.HeadCell>Name</Table.HeadCell>
      <Table.HeadCell>Date</Table.HeadCell>
      <Table.HeadCell className="hidden md:table-cell">Distance</Table.HeadCell>
      <Table.HeadCell className="hidden md:table-cell">
        Total Ascent
      </Table.HeadCell>
      <Table.HeadCell></Table.HeadCell>
    </Table.Head>
  );
  const noDataContent = (
    <Table.Row>
      <Table.Cell>{noResultsText || "You dont have any tours yet"}</Table.Cell>
      <Table.Cell></Table.Cell>
      <Table.Cell className="hidden md:table-cell"></Table.Cell>
      <Table.Cell className="hidden md:table-cell"></Table.Cell>
      <Table.Cell></Table.Cell>
    </Table.Row>
  );

  return (
    <Table className="rounded-b-none shadow-none" style={{ zIndex: 1 }}>
      {tableHeader}
      <Table.Body>
        {tours?.length === 0 && !isLoading && noDataContent}
        {tours?.map((tour) => (
          <Table.Row key={tour.id}>
            <Table.Cell>{tour.name}</Table.Cell>
            <Table.Cell>{tour.date.toLocaleDateString()}</Table.Cell>
            <Table.Cell className="hidden md:table-cell">
              {format(tour.distance)}
            </Table.Cell>
            <Table.Cell className="hidden md:table-cell">
              {format(tour.elevationUp)}
            </Table.Cell>
            <Table.Cell className="flex justify-end">
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
