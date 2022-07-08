import { NextPage } from "next";
import Table, {
  TableCell,
  TableHeaderCell,
  TableRow,
} from "@/components/common/table";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button, Spinner } from "flowbite-react";
import { useSession } from "next-auth/react";
import { Tour } from "@prisma/client";

const ToursTable: React.FC<{ isLoading: boolean; data: Tour[] | undefined }> = ({
  isLoading,
  data,
}) => {
  const router = useRouter();

  const handleAddClick = () => {
    router.push("/tours/create");
  };

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

  const noDataContent = (
    <TableRow>
      <TableCell>You dont have any tours yet</TableCell>
      <TableCell className="hidden md:table-cell"></TableCell>
      <TableCell></TableCell>
      <TableCell className="hidden md:table-cell"></TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
  return (
    <>
      <Table headerContent={tableHeader} className="rounded-b-none shadow-none">
        {data?.length === 0 || (isLoading && noDataContent)}
        {data?.map((tour) => (
          <TableRow key={tour.id}>
            <TableCell>{tour.name}</TableCell>
            <TableCell className="hidden md:table-cell truncate max-w-xs">
              {tour.description}
            </TableCell>
            <TableCell>{tour.distance}m</TableCell>
            <TableCell className="hidden md:table-cell">
              {tour.elevationUp}m
            </TableCell>
            <TableCell className="flex justify-end">
              <Link href={`/tours/${tour.id}`}>
                <span className="font-medium text-blue-500 cursor-pointer dark:text-blue-500 hover:underline">
                  Show
                </span>
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </Table>

      <div className="flex justify-end p-2 items-center bg-gray-100 dark:bg-gray-900 dark:text-gray-400 rounded-b-xl">
        <Button onClick={handleAddClick}>Add a new Tour</Button>
      </div>
    </>
  );
};

const ToursPage: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["tours.get-tours"]);
  const { status } = useSession();

  let content = <ToursTable isLoading={isLoading} data={data}></ToursTable>
  if (status === "unauthenticated") content = (<p>Access denied</p>)
  else if (status === "loading") content = (<Spinner size="xl" />)
  
  return (
    <LayoutBase>
      {content}
    </LayoutBase>
  )
};

export default ToursPage;
