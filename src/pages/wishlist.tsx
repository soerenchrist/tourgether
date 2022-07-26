import CardTitle from "@/components/common/cardTitle";
import ConfirmationModal from "@/components/common/confirmationDialog";
import LayoutBase from "@/components/layout/layoutBase";
import { PageProps, protectedServersideProps } from "@/server/common/protectedServersideProps";
import { trpc } from "@/utils/trpc";
import { Peak, WishlistItem } from "@prisma/client";
import { Card, Checkbox, Spinner, Table } from "flowbite-react";
import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMemo, useState } from "react";

const WishlistLine: React.FC<{
  item: WishlistItem & { peak: Peak };
  setShowModalItem: (item: string) => void;
  onRemove: () => void;
}> = ({ item, setShowModalItem, onRemove }) => {
  return (
    <Table.Row>
      <Table.Cell>
        <Checkbox
          checked={item.finished}
          onChange={() => setShowModalItem(item.id)}
        />
      </Table.Cell>
      <Table.Cell>
        <Link href={`/peaks/${item.peak.id}`}>
          <span className="text-blue-500 hover:underline cursor-pointer font-medium">
            {item.peak.name} ({item.peak.height} m)
          </span>
        </Link>
      </Table.Cell>
      <Table.Cell className="hidden md:table-cell">
        {item.addDate.toLocaleDateString()}
      </Table.Cell>
      <Table.Cell className="hidden lg:table-cell">
        {item.finishDate?.toLocaleDateString() ?? "-"}
      </Table.Cell>
      <Table.Cell className="flex justify-end">
        <span
          className="text-blue-500 hover:underline cursor-pointer font-medium"
          onClick={onRemove}
        >
          Remove
        </span>
      </Table.Cell>
    </Table.Row>
  );
};

const WishlistPageContent = () => {
  const [showModalItem, setShowModalItem] = useState<string>();
  const { data: wishlist, isLoading } = trpc.useQuery([
    "wishlist.get-wishlist",
  ]);
  const router = useRouter();
  const util = trpc.useContext();
  const { mutate: uncomplete } = trpc.useMutation("wishlist.uncomplete-items", {
    onSuccess: () => {
      util.invalidateQueries("wishlist.get-wishlist");
    },
  });
  const { mutate: complete } = trpc.useMutation("wishlist.complete-items", {
    onSuccess: () => {
      util.invalidateQueries("wishlist.get-wishlist");
    },
  });

  const { mutate: remove } = trpc.useMutation("wishlist.remove-from-wishlist", {
    onSuccess: () => {
      util.invalidateQueries("wishlist.get-wishlist");
    },
  });
  const item = useMemo(
    () => wishlist?.find((x) => x.id === showModalItem),
    [wishlist, showModalItem]
  );

  const finishedItems = useMemo(
    () => wishlist?.filter((x) => x.finished) ?? [],
    [wishlist]
  );
  const unfinishedItems = useMemo(
    () => wishlist?.filter((x) => !x.finished) ?? [],
    [wishlist]
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

    complete({
      itemIds: [item.id],
    });
    setShowModalItem(undefined);
  };

  const handleRemove = (item: WishlistItem) => {
    remove({
      id: item.id,
    });
  };

  const uncompleteItem = (item: string) => {
    const itemToUncomplete = wishlist.find((x) => x.id === item);
    if (itemToUncomplete) {
      uncomplete({
        itemIds: [item],
      });
    }
  };

  return (
    <Card>
      <CardTitle title="Your wish list" />

      <Table>
        <Table.Head>
          <Table.HeadCell></Table.HeadCell>
          <Table.HeadCell>Peak</Table.HeadCell>
          <Table.HeadCell className="hidden md:table-cell">
            Added on
          </Table.HeadCell>
          <Table.HeadCell className="hidden lg:table-cell">
            Completed on
          </Table.HeadCell>
          <Table.HeadCell></Table.HeadCell>
        </Table.Head>
        <Table.Body>
          {wishlist.length === 0 && (
            <Table.Row>
              <Table.Cell>
                {"You don't have any peak on your wishlist"}
              </Table.Cell>
            </Table.Row>
          )}

          {unfinishedItems.map((item) => (
            <WishlistLine
              key={item.id}
              item={item}
              onRemove={() => handleRemove(item)}
              setShowModalItem={setShowModalItem}
            />
          ))}

          {finishedItems.map((item) => (
            <WishlistLine
              key={item.id}
              item={item}
              onRemove={() => handleRemove(item)}
              setShowModalItem={uncompleteItem}
            />
          ))}
        </Table.Body>
      </Table>
      <ConfirmationModal
        show={showModalItem !== undefined}
        text={
          item?.finished
            ? "Do you want to mark the item as uncompleted?"
            : "Do you want to create a tour to the peak?"
        }
        accept={createTour}
        decline={skipCreate}
        acceptButton="Create Tour"
        cancelButton="Skip"
      />
    </Card>
  );
};

const WishlistPage: NextPage<PageProps> = ({ data }) => {
  return (
    <>
      <Head>
        <title>My Wishlist</title>
      </Head>
      <LayoutBase session={data.session}><WishlistPageContent></WishlistPageContent></LayoutBase>
    </>
  );
};

export const getServerSideProps = protectedServersideProps;

export default WishlistPage;
