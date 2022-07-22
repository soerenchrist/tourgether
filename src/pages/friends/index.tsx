import CardTitle from "@/components/common/cardTitle";
import ConfirmationModal from "@/components/common/confirmationDialog";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { Card, Spinner, Table } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

const FriendsPageContent = () => {
  const [quitUserId, setQuitUserId] = useState<string>();
  const { data: friends, isLoading } = trpc.useQuery([
    "friends.get-my-friends",
  ]);
  const util = trpc.useContext();
  const { mutate: quit } = trpc.useMutation("friends.quit-friendship", {
    onSuccess: () => {
      util.invalidateQueries("friends.get-my-friends");
      setQuitUserId(undefined);
    },
  });

  if (isLoading) return <Spinner size="xl" />;
  if (!friends) return <></>;

  const quitFriendship = () => {
    if (!quitUserId) return;

    quit({ userId: quitUserId });
  };

  return (
    <Card>
      <CardTitle title="Your friends" />
      <Table>
        <Table.Head>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell className="hidden md:table-cell">Email</Table.HeadCell>
          <Table.HeadCell></Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {friends.length === 0 && (
            <Table.Row>
              <Table.Cell>
                {"Start making connections with your friends!"}
              </Table.Cell>
            </Table.Row>
          )}
          {friends.map((f) => (
            <Table.Row key={f.id}>
              <Table.Cell>
                <Link href={`/profile/${f.id}`}>
                  <span className="text-blue-500 hover:underline font-medium cursor-pointer">
                    {f.name}
                  </span>
                </Link>
              </Table.Cell>
              <Table.Cell className="hidden md:table-cell">{f.email}</Table.Cell>
              <Table.Cell className="flex justify-end">
                <span
                  className="text-blue-500 hover:underline font-medium cursor-pointer"
                  onClick={() => setQuitUserId(f.id)}
                >
                  Quit
                </span>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <ConfirmationModal
        accept={quitFriendship}
        decline={() => setQuitUserId(undefined)}
        show={quitUserId !== undefined}
        text="Do you really want to quit your friendship?"
        acceptButton="Quit"
        acceptColor="failure"
      />
    </Card>
  );
};

const FriendsPage: NextPage = () => {
  const { status } = useSession();

  let content = <FriendsPageContent></FriendsPageContent>;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <></>;

  return (
    <>
      <Head>
        <title>My Friends</title>
      </Head>
      <LayoutBase>{content}</LayoutBase>
    </>
  );
};

export default FriendsPage;
