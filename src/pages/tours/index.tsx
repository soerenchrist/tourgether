import { NextPage } from "next";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button, Card, Spinner, Table } from "flowbite-react";
import { useSession } from "next-auth/react";
import { Tour } from "@prisma/client";
import CardTitle from "@/components/common/cardTitle";

const ToursTable: React.FC<{
  isLoading: boolean;
  data: Tour[] | undefined;
}> = ({ isLoading, data }) => {
  const router = useRouter();

  const handleAddClick = () => {
    router.push("/tours/create");
  };

  const tableHeader = (
    <Table.Head>
      <Table.HeadCell>Name</Table.HeadCell>
      <Table.HeadCell className="hidden md:table-cell">
        Description
      </Table.HeadCell>
      <Table.HeadCell>Distance</Table.HeadCell>
      <Table.HeadCell className="hidden md:table-cell">
        Elevation
      </Table.HeadCell>
      <Table.HeadCell></Table.HeadCell>
    </Table.Head>
  );

  const noDataContent = (
    <Table.Row>
      <Table.Cell>You dont have any tours yet</Table.Cell>
      <Table.Cell className="hidden md:table-cell"></Table.Cell>
      <Table.Cell></Table.Cell>
      <Table.Cell className="hidden md:table-cell"></Table.Cell>
      <Table.Cell></Table.Cell>
    </Table.Row>
  );
  return (
    <Card>
      <CardTitle title="Your Tours" />
      <Table className="rounded-b-none shadow-none">
        {tableHeader}
        <Table.Body>
          {data?.length === 0 || (isLoading && noDataContent)}
          {data?.map((tour) => (
            <Table.Row key={tour.id}>
              <Table.Cell>{tour.name}</Table.Cell>
              <Table.Cell className="hidden md:table-cell truncate max-w-xs">
                {tour.description.length === 0 ? <span>-</span> : tour.description}
              </Table.Cell>
              <Table.Cell>{tour.distance}m</Table.Cell>
              <Table.Cell className="hidden md:table-cell">
                {tour.elevationUp}m
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

      <div className="flex justify-end p-2 items-center">
        <Button onClick={handleAddClick}>Add a new Tour</Button>
      </div>
    </Card>
  );
};

const ToursPage: NextPage = () => {
  const { data, isLoading } = trpc.useQuery(["tours.get-tours", {
    pagination: {
      count: 10,
      page: 1
    }
  }]);
  const { status } = useSession();

  let content = <ToursTable isLoading={isLoading} data={data}></ToursTable>;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <Spinner size="xl" />;

  return <LayoutBase>{content}</LayoutBase>;
};

export default ToursPage;
