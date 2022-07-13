import CardTitle from "@/components/common/cardTitle";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { Card, Spinner, Table } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { ReactNode } from "react";

const MyInvitationsPageContent: React.FC = () => {
  const { data, isLoading } = trpc.useQuery(["invite.get-my-invitations"]);

  const util = trpc.useContext();
  const { mutate: deleteInvitation } = trpc.useMutation(
    "invite.decline-invitation",
    {
      onSuccess: () => {
        util.invalidateQueries("invite.get-my-invitations");
      },
    }
  );

  if (isLoading || !data) return <Spinner size="xl" />;

  const isExpired = (expiry: Date) => {
    const now = new Date();
    return expiry < now;
  };

  const revoke = (id: string) => {
    deleteInvitation({
      invite_token: id,
    });
  };

  return (
    <Card>
      <CardTitle title="My invitations" />
      <Table>
        <Table.Head>
          <Table.HeadCell>Tour</Table.HeadCell>
          <Table.HeadCell>Expires on</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell></Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {data.length === 0 && (
            <Table.Row>
              <Table.Cell>You have no pending invitations</Table.Cell>
            </Table.Row>
          )}
          {data.map((link) => (
            <Table.Row key={link.invite_token}>
              <Table.Cell>
                <Link href={`/tours/${link.tour.id}`}>
                  <span className="text-blue-500 hover:underline cursor-pointer font-medium">
                    {link.tour.name}
                  </span>
                </Link>
              </Table.Cell>
              <Table.Cell>
                {link.validUnit.toLocaleDateString()}{" "}
                {link.validUnit.toLocaleTimeString()}
              </Table.Cell>
              <Table.Cell>
                <span
                  className={isExpired(link.validUnit) ? "text-red-600" : "text-green-500"}
                >
                  {isExpired(link.validUnit) ? "Expired" : "Active"}
                </span>
              </Table.Cell>
              <Table.Cell className="flex justify-end">
                <span
                  onClick={() => revoke(link.invite_token)}
                  className="text-blue-500 hover:underline cursor-pointer font-medium"
                >
                  {isExpired(link.validUnit) ? "Delete" : "Revoke"}
                </span>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
};

const MyInvitationsPage: NextPage = () => {
  const { status } = useSession();

  let content: ReactNode;
  if (status === "loading") content = <Spinner size="xl" />;
  else if (status === "unauthenticated") content = <p>Access denied</p>;
  else content = <MyInvitationsPageContent />;

  return <LayoutBase>{content}</LayoutBase>;
};

export default MyInvitationsPage;
