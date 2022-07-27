import CardTitle from "@/components/common/cardTitle";
import Meta from "@/components/common/meta";
import LayoutBase from "@/components/layout/layoutBase";
import {
  PageProps,
  protectedServersideProps,
} from "@/server/common/protectedServersideProps";
import { trpc } from "@/utils/trpc";
import { Button, Card, Spinner, Table } from "flowbite-react";
import { NextPage } from "next";

const MyInvitationsPageContent: React.FC = () => {
  const { data, isLoading } = trpc.useQuery(["friends.get-my-friend-requests"]);

  const util = trpc.useContext();
  const { mutate: deleteInvitation } = trpc.useMutation(
    "friends.decline-friend-request",
    {
      onSuccess: () => {
        util.invalidateQueries("friends.get-my-friend-requests");
      },
    }
  );
  const { mutate: acceptInvitation } = trpc.useMutation(
    "friends.accept-friend-request",
    {
      onSuccess: () => {
        util.invalidateQueries("friends.get-my-friend-requests");
      },
    }
  );

  if (isLoading || !data) return <Spinner size="xl" />;

  const decline = (id: string) => {
    deleteInvitation({
      userId: id,
    });
  };

  const accept = (id: string) => {
    acceptInvitation({
      userId: id,
    });
  };

  return (
    <Card>
      <CardTitle title="My friend requests" />
      <Table>
        <Table.Head>
          <Table.HeadCell>From</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell></Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {data.length === 0 && (
            <Table.Row>
              <Table.Cell colSpan={2}>
                You have no pending invitations
              </Table.Cell>
            </Table.Row>
          )}
          {data.map((link) => (
            <Table.Row key={link.user1Id}>
              <Table.Cell>
                <b>{link.user1.name}</b>
              </Table.Cell>
              <Table.Cell>
                {link.state === "PENDING" && "Pending..."}
              </Table.Cell>
              <Table.Cell className="flex justify-end gap-2">
                <Button onClick={() => accept(link.user1Id)} color="success">
                  Accept
                </Button>
                <Button
                  onClick={() => decline(link.user1Id)}
                  outline
                  color="light"
                >
                  Decline
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
};

const MyInvitationsPage: NextPage<PageProps> = ({ data }) => {
  return (
    <>
      <Meta title="My Friend Requests"></Meta>
      <LayoutBase session={data.session}>
        <MyInvitationsPageContent />
      </LayoutBase>
    </>
  );
};

export const getServerSideProps = protectedServersideProps;

export default MyInvitationsPage;
