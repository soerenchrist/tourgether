import { NextPage } from "next";
import Table, {
  TableCell,
  TableHeaderCell,
  TableRow,
} from "@/components/common/table";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import Link from "next/link";

const Tours: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["tours.get-tours"]);

  if (isLoading || !data) return <div>Loading...</div>;

  const tableHeader = (
    <tr>
      <TableHeaderCell>Name</TableHeaderCell>
      <TableHeaderCell className="hidden md:table-cell">
        Description
      </TableHeaderCell>
      <TableHeaderCell>Distance</TableHeaderCell>
      <TableHeaderCell className="hidden md:table-cell">
        Elevation
      </TableHeaderCell>
      <TableHeaderCell></TableHeaderCell>
    </tr>
  );

  return (
    <LayoutBase>
      <Table headerContent={tableHeader}>
        {data.map((tour) => (
          <TableRow key={tour.id}>
            <TableCell>{tour.name}</TableCell>
            <TableCell className="hidden md:table-cell truncate max-w-md">
              {tour.description}
            </TableCell>
            <TableCell>{tour.distance}m</TableCell>
            <TableCell className="hidden md:table-cell">
              {tour.elevationUp}m
            </TableCell>
            <TableCell>
              <Link href={`/tours/${tour.id}`}>
                <span className="font-medium text-blue-500 cursor-pointer dark:text-blue-500 hover:underline">
                  Show
                </span>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </LayoutBase>
  );
};

export default Tours;
