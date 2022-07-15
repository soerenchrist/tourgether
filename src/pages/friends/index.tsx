import CardTitle from "@/components/common/cardTitle";
import CreateInvitationButton from "@/components/friends/createInvitationButton";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { Card, Spinner, Table } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";

const FriendsPageContent = () => {
  const { data: friends, isLoading } = trpc.useQuery(["friends.get-my-friends"])

  if (isLoading) return <Spinner size="xl" />
  if (!friends) return <></>


  return <Card>
    <CardTitle title="Your friends" />
    <Table>
      <Table.Head>
        <Table.HeadCell>
          Name
        </Table.HeadCell>
        <Table.HeadCell>
          Email
        </Table.HeadCell>
      </Table.Head>
      <Table.Body>
        {friends.length === 0 && <Table.Row><Table.Cell>{"Start making connections with your friends!"}</Table.Cell></Table.Row>}
        {friends.map(f => (
          <Table.Row key={f.id}>
            <Table.Cell>
              {f.name}
            </Table.Cell>
            <Table.Cell>
              {f.email}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
    <CreateInvitationButton />
  </Card>
}

const FriendsPage: NextPage = () => {
  const { status } = useSession();

  let content = <FriendsPageContent></FriendsPageContent>;
  if (status === "unauthenticated") content = <p>Access denied</p>
  else if (status === "loading") content = <Spinner size="xl"></Spinner>

  return <LayoutBase>{content}</LayoutBase>
}

export default FriendsPage;