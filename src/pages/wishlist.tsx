import CardTitle from "@/components/common/cardTitle";
import ConfirmDeleteModal from "@/components/common/confirmDeleteModal";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { Card, Checkbox, Spinner, Table } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

const WishlistContent = () => {
  const [showModalItem, setShowModalItem] = useState<string>();
  const { data: wishlist, isLoading } = trpc.useQuery([
    "wishlist.get-wishlist",
  ]);
  const router = useRouter();
  const { mutate: removeFromWishlist } = trpc.useMutation(
    "wishlist.remove-from-wishlist"
  );
  const item = useMemo(
    () => wishlist?.find((x) => x.id === showModalItem),
    [wishlist, showModalItem]
  );

  if (isLoading) return <Spinner size="xl" />;
  if (!wishlist) return <></>;

  const createTour = () => {
    if (!item) return;

    router.push(`/tours/create/?peak=${item.peakId}`);
    setShowModalItem(undefined);
  };

  const skipCreate = () => {
    if (!item) return;
    removeFromWishlist({
      peakId: item.peakId,
    });
    setShowModalItem(undefined);
  };

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
          {wishlist.length === 0 && (
            <Table.Row>
              <Table.Cell>
                {"You don't have any peak on your wishlist"}
              </Table.Cell>
            </Table.Row>
          )}
          {wishlist.map((item) => (
            <Table.Row key={item.id}>
              <Table.Cell>
                <Checkbox onChange={() => setShowModalItem(item.id)} />
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
      <ConfirmDeleteModal
        show={showModalItem !== undefined}
        text="Do you want to create a tour to the peak?"
        accept={createTour}
        decline={skipCreate}
        acceptButton="Create Tour"
        cancelButton="Cancel"
      />
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
