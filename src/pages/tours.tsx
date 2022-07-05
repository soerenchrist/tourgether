import { NextPage } from "next";
import Card from "../common/card";
import Table, { TableCell, TableHeaderCell, TableRow } from "../common/table";
import LayoutBase from "../components/layout/layoutBase";
import { trpc } from "../utils/trpc";

const Tours: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["tours.get-tours"]);

  if (isLoading || !data) return <div>Loading...</div>;

  const tableHeader = (
    <tr>
      <TableHeaderCell>Name</TableHeaderCell>
      <TableHeaderCell className="hidden md:table-cell">Description</TableHeaderCell>
      <TableHeaderCell>Distance</TableHeaderCell>
      <TableHeaderCell className="hidden md:table-cell">Elevation</TableHeaderCell>
      <TableHeaderCell></TableHeaderCell>
    </tr>
  );

  return (
    <LayoutBase>
      <div className="h-screen justify-between p-8">
        <Table headerContent={tableHeader}>
          {data.map((tour) => (
            <TableRow key={tour.id}>
              <TableCell>{tour.name}</TableCell>
              <TableCell className="hidden md:table-cell">{tour.description}</TableCell>
              <TableCell>{tour.distance}m</TableCell>
              <TableCell className="hidden md:table-cell">{tour.elevationUp}m</TableCell>
              <TableCell>
                    <a href="#" className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Show</a>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
    </LayoutBase>
  );
};

export default Tours;
