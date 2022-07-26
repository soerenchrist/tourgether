import CardTitle from "@/components/common/cardTitle";
import { List, ListItem } from "@/components/common/list";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { Avatar, Card, Dropdown, Spinner } from "flowbite-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactNode, useMemo, useState } from "react";
import ConfirmationModal from "@/components/common/confirmationDialog";
import NotFound from "@/components/common/notFound";
import Link from "next/link";
import { Visibility } from "@prisma/client";
import ChartArea from "@/components/tours/charts/chartArea";
import LikeButton from "@/components/tours/likeButton";
import CommentButton from "@/components/tours/commentButton";
import Skeleton from "@/components/common/skeleton";
import DownloadGpxButton from "@/components/tours/downloadGpxButton";
import { parseGpx } from "@/lib/gpxLib";
import { Point } from "@/server/router/tours";
import Icon from "@mdi/react";
import { mdiDelete, mdiDotsVertical, mdiPencil } from "@mdi/js";
import AddFriendsModal from "@/components/friends/addFriendsModal";
import ImagesArea from "@/components/tours/imagesArea";
import {
  PageProps,
  protectedServersideProps,
} from "@/server/common/protectedServersideProps";
import { NextPage } from "next";

const Map = dynamic(() => import("../../components/maps/tourMap"), {
  ssr: false,
});

const useCompanions = (tourId: string) => {
  return trpc.useQuery([
    "tours.get-companions",
    {
      tourId,
    },
  ]);
};

const downloadAndParse = async (fileUrl: string): Promise<Point[]> => {
  const response = await fetch(fileUrl);
  const gpx = await response.text();
  const results = parseGpx(gpx);
  return results.points.map((x) => ({
    elevation: x.elevation,
    latitude: x.latitude,
    longitude: x.longitude,
    time: x.time,
    heartRate: x.heartRate,
    temperature: x.temperature,
  }));
};

const OwnerMenu: React.FC<{
  setShowDelete: (value: boolean) => void;
  onEdit: () => void;
}> = ({ setShowDelete, onEdit }) => {
  return (
    <Dropdown
      inline={true}
      arrowIcon={false}
      label={<Icon path={mdiDotsVertical} className="h-5 w-5 cursor-pointer" />}
    >
      <Dropdown.Item onClick={() => setShowDelete(true)}>
        <div className="flex">
          <Icon path={mdiDelete} className="w-5 h-5 mr-2" />
          Delete this Tour
        </div>
      </Dropdown.Item>
      <Dropdown.Item onClick={onEdit}>
        <div className="flex">
          <Icon path={mdiPencil} className="w-5 h-5 mr-2" />
          Edit Tour
        </div>
      </Dropdown.Item>
    </Dropdown>
  );
};

const TourPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data, isLoading } = trpc.useQuery(["tours.get-tour-by-id", { id }], {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const { data: companions, isLoading: companionsLoading } = useCompanions(id);
  const [points, setPoints] = useState<Point[]>([]);
  const [addFriends, setAddFriends] = useState(false);

  const { data: downloadUrl } = trpc.useQuery(
    [
      "tours.get-download-url",
      {
        gpxUrl: data?.gpxUrl ?? "",
      },
    ],
    {
      enabled: data?.gpxUrl != null,
      refetchOnWindowFocus: false,
      async onSuccess(url) {
        if (url) {
          const points = await downloadAndParse(url);
          setPoints(points);
        }
      },
    }
  );

  const router = useRouter();
  const [hoverPoint, setHoverPoint] = useState<Point>();
  const { mutate: deleteTourOnServer, isLoading: isDeleting } =
    trpc.useMutation("tours.delete-tour", {
      onSuccess: () => {
        router.push("/tours");
      },
    });

  const [showDelete, setShowDelete] = useState(false);
  const peaks = useMemo(() => data?.tourPeaks?.map((t) => t.peak), [data]);

  const onEdit = () => router.push(`/tours/edit/${id}`);

  if (!isLoading && !data) return <NotFound message="Tour not found!" />;

  const deleteTour = () => {
    if (!data) return;
    deleteTourOnServer({ id });
  };

  const getVisibilityText = (visibility?: Visibility) => {
    if (visibility === "FRIENDS") return "Friends only";
    else if (visibility === "PRIVATE") return "Only you";
    return "Everyone";
  };

  return (
    <>
      <Head>
        <title>Tour - {data?.name ?? ""}</title>
      </Head>
      <div className="flex flex-col gap-4">
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-6">
          <Card>
            <div className="flex justify-between">
              {isLoading && <Skeleton className="h-8 w-72"></Skeleton>}
              {!isLoading && (
                <CardTitle
                  title={data?.name ?? ""}
                  subtitle={`Created by ${
                    data?.creator.name
                  } on ${data?.createdAt?.toLocaleDateString()}`}
                />
              )}

              <div className="flex justify-end items-center gap-3">
                {isLoading && <Spinner size="md" />}
                {!isLoading && (
                  <>
                    <CommentButton tour={data!} />
                    <DownloadGpxButton downloadUrl={downloadUrl} tour={data!} />
                    {!data?.viewer && (
                      <OwnerMenu
                        onEdit={onEdit}
                        setShowDelete={setShowDelete}
                      />
                    )}

                    {data?.viewer && <LikeButton tour={data} />}
                  </>
                )}
              </div>
            </div>

            <List className="mt-4">
              <ListItem
                title={`${data?.distance} m`}
                isLoading={isLoading}
                subtitle="Distance"
              />
              <ListItem
                title={`${data?.elevationUp} m`}
                subtitle="Total Ascent"
                isLoading={isLoading}
              />
              <ListItem
                title={`${data?.elevationDown} m`}
                subtitle="Total Descent"
                isLoading={isLoading}
              />

              {(data?.tourPeaks.length ?? 0) > 0 && (
                <ListItem
                  title={peaks?.map((tp) => (
                    <Link href={`/peaks/${tp.id}`} key={tp.id}>
                      <span className="cursor-pointer mr-2 text-blue-500 font-medium hover:underline w-auto">
                        {tp.name} ({tp.height} m)
                      </span>
                    </Link>
                  ))}
                  isLoading={isLoading}
                  subtitle="Peaks"
                />
              )}

              <ListItem
                title={`${data?.date.toLocaleDateString()}`}
                isLoading={isLoading}
                subtitle="Date"
              />
              {data?.startTime && (
                <ListItem
                  title={`${data!.startTime}`}
                  isLoading={isLoading}
                  subtitle="Start time"
                />
              )}

              {data?.endTime && (
                <ListItem
                  title={`${data!.endTime}`}
                  isLoading={isLoading}
                  subtitle="End time"
                />
              )}

              {data?.viewer && (
                <ListItem
                  title={`${data!.creator.name} (${data!.creator.email})`}
                  isLoading={isLoading}
                  subtitle="Created by"
                ></ListItem>
              )}

              {data?.description && (
                <ListItem isLoading={isLoading} subtitle={data!.description} />
              )}

              <ListItem
                title={getVisibilityText(data?.visibility)}
                isLoading={isLoading}
                subtitle="Visibility"
              ></ListItem>
              <div className="flex justify-between gap-2">
                <ListItem
                  title={
                    <>
                      <span>
                        {companions?.map((x) => x.user.name).join(",")}
                      </span>
                      {!data?.viewer && (
                        <span
                          style={{
                            marginLeft:
                              (companions?.length ?? 0) > 0 ? "5px" : "0",
                          }}
                          className="text-blue-500 font-medium hover:underline cursor-pointer"
                          onClick={() => setAddFriends(true)}
                        >
                          Add
                        </span>
                      )}
                    </>
                  }
                  subtitle="Companions"
                  isLoading={companionsLoading}
                ></ListItem>
                {companions && (
                  <div>
                    <div className="h-2"></div>
                    <Avatar.Group>
                      {companions.map((x) => (
                        <Avatar
                          key={x.userId}
                          stacked
                          rounded
                          img={x.user.image ?? ""}
                        />
                      ))}
                    </Avatar.Group>
                  </div>
                )}
              </div>
            </List>
          </Card>
          <Card>
            <Map hoverPoint={hoverPoint} peaks={peaks} points={points} />
          </Card>
        </div>
        {points && points.length > 0 && (
          <ChartArea points={points} onHover={(e) => setHoverPoint(e)} />
        )}
        <ImagesArea tourId={id} canAddImages={!data?.viewer} />
      </div>
      <AddFriendsModal
        tourId={id}
        show={addFriends}
        companions={companions}
        onClose={() => setAddFriends(false)}
      />
      <ConfirmationModal
        text={
          data?.viewer
            ? "Do you really want to remove the tour? You will lose access to the data!"
            : "Do you really want to delete the tour? All data will be lost!"
        }
        isLoading={isDeleting}
        show={showDelete}
        accept={deleteTour}
        acceptColor="failure"
        acceptButton={data?.viewer ? "Remove" : "Delete"}
        decline={() => setShowDelete(false)}
      />
    </>
  );
};

const TourPage: NextPage<PageProps> = ({ data }) => {
  const { query } = useRouter();
  const { id } = query;
  if (!id || typeof id !== "string") {
    return <></>;
  }

  return (
    <>
    <Head>
      <title>Display tour</title>
    </Head>
      <LayoutBase session={data.session}>
        <TourPageContent id={id} />
      </LayoutBase>
    </>
  );
};

export const getServerSideProps = protectedServersideProps;

export default TourPage;
