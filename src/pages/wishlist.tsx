import CardTitle from "@/components/common/cardTitle";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { Card, Checkbox, Spinner, Table } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";

const WishlistContent = () => {
  const { data: wishlist, isLoading } = trpc.useQuery([
    "wishlist.get-wishlist",
  ]);

  if (isLoading) return <Spinner size="xl" />;
  if (!wishlist) return <></>;

  return (
    <Card>
      <CardTitle title="Your wishlist" />

      <Table>
        <Table.Head>
          <Table.HeadCell></Table.HeadCell>
          <Table.HeadCell>Peak</Table.HeadCell>
          <Table.HeadCell>Height</Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {wishlist.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>
                <Checkbox />
              </Table.Cell>
              <Table.Cell>
                <Link href={`/peaks/${item.peak.id}`}>
                  <span className="text-blue-500 hover:underline cursor-pointer font-medium">
                    {item.peak.name}
                  </span>
                </Link>
              </Table.Cell>
              <Table.Cell>{item.peak.height} m</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </Card>
  );
};

const WishlistPage: NextPage = () => {
  const { status } = useSession();

  let content = <WishlistContent></WishlistContent>;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <Spinner size="xl"></Spinner>;

  return <LayoutBase>{content}</LayoutBase>;
};

export default WishlistPage;
