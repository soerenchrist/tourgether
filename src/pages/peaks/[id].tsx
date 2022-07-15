import CardTitle from "@/components/common/cardTitle";
import ConfirmationModal from "@/components/common/confirmationDialog";
import NotFound from "@/components/common/notFound";
import LayoutBase from "@/components/layout/layoutBase";
import ToursTable from "@/components/tours/toursTable";
import { trpc } from "@/utils/trpc";
import {
  DotsVerticalIcon,
  HeartIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/solid";
import { HeartIcon as OutlinedHeartIcon } from "@heroicons/react/outline";
import { Card, Dropdown, Spinner, Tooltip } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";

const Map = dynamic(() => import("../../components/maps/peakMap"), {
  ssr: false,
});

const WishlistButton: React.FC<{ id: string }> = ({ id }) => {
  const util = trpc.useContext();
  const options = {
    onSuccess: () => {
      util.invalidateQueries("wishlist.get-wishlist-item");
    },
  };
  const { mutate: addToWishlist } = trpc.useMutation(
    "wishlist.add-to-wishlist",
    options
  );
  const { mutate: removeFromWishlist } = trpc.useMutation(
    "wishlist.remove-from-wishlist",
    options
  );

  const { data: wishlistItem, isLoading: wishlistLoading } = trpc.useQuery([
    "wishlist.get-wishlist-item",
    {
      peakId: id,
    },
  ]);

  if (wishlistLoading) return <Spinner />;
  if (wishlistItem === undefined) return <></>;

  const classes =
    wishlistItem === null
      ? "text-gray-800 w-8 h-8 hover:text-red-500 cursor-pointer"
      : "text-red-500 w-8 h-8 cursor-pointer";

  const toggle = () => {
    if (wishlistItem === null) {
      addToWishlist({ peakId: id });
    } else {
      removeFromWishlist({ peakId: id });
    }
  };

  let icon: ReactNode;
  if (wishlistItem === null) icon = <OutlinedHeartIcon onClick={toggle} className={classes} />;
  else icon = <HeartIcon onClick={toggle} className={classes} />;

  return (
    <Tooltip
      content={
        wishlistItem === null ? "Put on your wishlist" : "Remove from wishlist"
      }
    >
      {icon}
    </Tooltip>
  );
};

const PeakDetails: React.FC<{ id: string }> = ({ id }) => {
  const [showDelete, setShowDelete] = useState(false);
  const router = useRouter();
  const { mutate: deletePeak } = trpc.useMutation("peaks.delete-peak", {
    onSuccess: () => {
      router.push("/peaks");
    },
  });
  const { data: peak, isLoading } = trpc.useQuery([
    "peaks.get-peak-by-id",
    {
      id,
    },
  ]);
  const { data: tours, isLoading: toursLoading } = trpc.useQuery([
    "peaks.get-tours-by-peak",
    {
      peakId: id,
    },
  ]);

  if (isLoading) {
    return <Spinner size="xl" />;
  }
  if (!peak) return <NotFound message="Peak not found..."></NotFound>;

  const onDeletePeak = () => {
    deletePeak({ id });
  };
  return (
    <>
      <Head>
        <title>Peak - {peak.name}</title>
      </Head>
      <div className="grid xl:grid-cols-2 grid-cols-1 gap-4">
        <Card>
          <div className="flex flex-col h-full justify-start gap-4">
            <div className="flex justify-between">
              <CardTitle title={`${peak.name} (${peak.height} m)`} />
              <div className="flex justify-end">
                <WishlistButton id={id} />
                {peak.creatorId && (
                  <Dropdown
                    inline={true}
                    arrowIcon={false}
                    label={
                      <DotsVerticalIcon className="h-5 w-5 cursor-pointer" />
                    }
                  >
                    <div className="bg-white h-full w-full">
                      <Dropdown.Item onClick={() => setShowDelete(true)}>
                        <div className="flex">
                          <TrashIcon className="w-5 h-5 mr-2" />
                          Delete this Peak
                        </div>
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => router.push(`/peaks/edit/${peak.id}`)}
                      >
                        <div className="flex">
                          <PencilIcon className="w-5 h-5 mr-2" />
                          Edit Peak
                        </div>
                      </Dropdown.Item>
                    </div>
                  </Dropdown>
                )}
              </div>
            </div>
            <Map peak={peak} />
          </div>
        </Card>
        <Card>
          <div className="flex flex-col justify-start h-full gap-4">
            <CardTitle title={`Your Tours to ${peak.name}`} />
            <ToursTable tours={tours} isLoading={toursLoading} />
          </div>
        </Card>
      </div>
      <ConfirmationModal
        text="Do you really want to delete this peak? All data will be lost?"
        show={showDelete}
        acceptColor="failure"
        accept={onDeletePeak}
        decline={() => setShowDelete(false)}
      />
    </>
  );
};

const PeakDetailsPage: NextPage = () => {
  const { status } = useSession();
  const { query } = useRouter();
  const { id } = query;

  let content: ReactNode;
  if (!id || typeof id !== "string") {
    content = <div>No ID</div>;
  } else {
    if (status === "unauthenticated") content = <div>Access denied</div>;
    else if (status === "loading") content = <Spinner size="xl"></Spinner>;
    else content = <PeakDetails id={id} />;
  }

  return <LayoutBase>{content}</LayoutBase>;
};

export default PeakDetailsPage;
