import CardTitle from "@/components/common/cardTitle";
import ConfirmationModal from "@/components/common/confirmationDialog";
import NotFound from "@/components/common/notFound";
import LayoutBase from "@/components/layout/layoutBase";
import ToursTable from "@/components/tours/toursTable";
import { trpc } from "@/utils/trpc";
import { Card, Checkbox, Dropdown, Label, Spinner, Tooltip } from "flowbite-react";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";
import PeakDetailCard from "@/components/peaks/peakDetailCard";
import Icon from "@mdi/react";
import {
  mdiDelete,
  mdiDotsVertical,
  mdiHeart,
  mdiHeartOutline,
  mdiPencil,
} from "@mdi/js";
import { type SortState } from "@/components/common/sortableCol";
import { type Tour } from "@prisma/client";
import {
  PageProps,
  protectedServersideProps,
} from "@/server/common/protectedServersideProps";

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
      removeFromWishlist({ id: wishlistItem.id });
    }
  };

  let icon: ReactNode;
  if (wishlistItem === null)
    icon = (
      <span onClick={toggle}>
        <Icon path={mdiHeartOutline} className={classes} />
      </span>
    );
  else
    icon = (
      <span onClick={toggle}>
        <Icon path={mdiHeart} className={classes} />
      </span>
    );

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
  const [onlyOwnTours, setOnlyOwnTours] = useState(false);
  const [sortState, setSortState] = useState<SortState<Tour>>({
    order: "desc",
    sortKey: "date",
  });
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
      orderBy: sortState.sortKey,
      orderDir: sortState.order,
      onlyOwn: onlyOwnTours
    },
  ]);
  const { data: wikidata, isLoading: wikidataLoading } = trpc.useQuery(
    [
      "wikidata.get-wikidata",
      {
        wikidataId: peak?.wikidata ?? "",
      },
    ],
    {
      refetchOnWindowFocus: false,
      enabled: peak?.wikidata !== undefined && peak?.wikidata !== null,
    }
  );

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
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-4">
        <PeakDetailCard
          peak={peak}
          wikidata={wikidata}
          wikidataLoading={wikidataLoading}
        />
        <Card>
          <div className="flex flex-col h-full justify-start gap-4">
            <div className="flex justify-end">
              <WishlistButton id={id} />
              {peak.creatorId && (
                <Dropdown
                  inline={true}
                  arrowIcon={false}
                  label={
                    <Icon
                      path={mdiDotsVertical}
                      className="h-5 w-5 cursor-pointer"
                    />
                  }
                >
                  <div className="bg-white h-full w-full">
                    <Dropdown.Item onClick={() => setShowDelete(true)}>
                      <div className="flex">
                        <Icon path={mdiDelete} className="w-5 h-5 mr-2" />
                        Delete this Peak
                      </div>
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => router.push(`/peaks/edit/${peak.id}`)}
                    >
                      <div className="flex">
                        <Icon path={mdiPencil} className="w-5 h-5 mr-2" />
                        Edit Peak
                      </div>
                    </Dropdown.Item>
                  </div>
                </Dropdown>
              )}
            </div>
            <Map peak={peak} dominance={wikidata?.dominance} />
          </div>
        </Card>
        {(tours?.length ?? 0) > 0 && (
          <div className="lg:col-span-2 col-span-1">
            <Card>
              <div className="flex flex-col justify-start h-full gap-4">
                <CardTitle title={`Tours to ${peak.name}`} />
                
                <div className="flex gap-2 items-center">
                  <Checkbox
                    id="onlyOwn"
                    checked={onlyOwnTours}
                    onChange={(e) => setOnlyOwnTours(e.target.checked)}
                  />
                  <Label htmlFor="onlyOwn">Show only my tours</Label>
                </div>
                <ToursTable
                  sortState={sortState}
                  onChangeSortState={setSortState}
                  tours={tours}
                  isLoading={toursLoading}
                  noResultsText={`You don't have any tours to ${peak.name} yet.`}
                />
              </div>
            </Card>
          </div>
        )}
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

const PeakDetailsPage: NextPage<PageProps> = ({ data }) => {
  const { query } = useRouter();
  const { id } = query;

  if (!id || typeof id !== "string") {
    return <></>;
  }

  return (
    <LayoutBase session={data.session}>
      <PeakDetails id={id} />
    </LayoutBase>
  );
};

export const getServerSideProps = protectedServersideProps;

export default PeakDetailsPage;
