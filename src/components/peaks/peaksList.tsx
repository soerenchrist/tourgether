import { Peak } from "@prisma/client";
import { Spinner, Table } from "flowbite-react";
import Link from "next/link";


const PeaksList: React.FC<{peaks: Peak[] | undefined | undefined, isLoading: boolean }> = ({ peaks, isLoading }) => {

  const loader = <Table.Row><div className="p-4 flex justify-center"><Spinner size="xl" /></div></Table.Row>

  return (
    <Table>
      <Table.Head>
        <Table.HeadCell>
          Name
        </Table.HeadCell>
        <Table.HeadCell>
          Height
        </Table.HeadCell>
        <Table.HeadCell></Table.HeadCell>
      </Table.Head>
      <Table.Body>
        {isLoading && loader}
        {peaks?.map(peak => (
          <Table.Row key={peak.id}>
            <Table.Cell>
              {peak.name}
            </Table.Cell>
            <Table.Cell>
              {peak.height} m
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
  )
}

export default PeaksList;