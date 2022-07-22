import { mdiCancel, mdiCheckCircle } from "@mdi/js";
import Icon from "@mdi/react";
import { Peak } from "@prisma/client";
import { Spinner, Table, Tooltip } from "flowbite-react";
import Link from "next/link";

const PeaksList: React.FC<{
  peaks:
    | (Peak & {
        tourCount: number;
      })[]
    | undefined
    | undefined;
  isLoading: boolean;
}> = ({ peaks, isLoading }) => {
  const loader = (
    <Table.Row>
      <Table.Cell>
        <div className="p-4 flex justify-center">
          <Spinner size="xl" />
        </div>
      </Table.Cell>
    </Table.Row>
  );

  return (
    <Table>
      <Table.Head>
        <Table.HeadCell>Name</Table.HeadCell>
        <Table.HeadCell className="hidden md:table-cell">Height</Table.HeadCell>
        <Table.HeadCell className="hidden md:table-cell">
          Climbed
        </Table.HeadCell>
        <Table.HeadCell></Table.HeadCell>
      </Table.Head>
      <Table.Body>
        {isLoading && loader}
        {peaks?.length === 0 && (
          <Table.Row>
            <Table.Cell colSpan={4}>
              No peaks found...
            </Table.Cell>
          </Table.Row>
        )}
        {peaks?.map((peak) => (
          <Table.Row key={peak.id}>
            <Table.Cell>{peak.name}</Table.Cell>
            <Table.Cell className="hidden md:table-cell">{peak.height} m</Table.Cell>
            <Table.Cell className="hidden md:table-cell">
              {peak.tourCount > 0 ? (
                <Tooltip
                  content={`You climbed ${peak.name} ${peak.tourCount} times!`}
                >
                  <Icon path={mdiCheckCircle} className="ml-4 w-5 h-5 text-green-500" />
                </Tooltip>
              ) : (
                <Icon path={mdiCancel}  className="ml-4 w-5 h-5 text-red-500" />
              )}
            </Table.Cell>
            <Table.Cell className="flex justify-end">
              <Link href={`/peaks/${peak.id}`}>
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

export default PeaksList;
