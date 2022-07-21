import CardTitle from "@/components/common/cardTitle";
import { List, ListItem } from "@/components/common/list";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { Card, Dropdown, Spinner } from "flowbite-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactNode, useMemo, useState } from "react";
import {
  DotsVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/solid";
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

const Map = dynamic(() => import("../../components/maps/tourMap"), {
  ssr: false,
});

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
      label={<DotsVerticalIcon className="h-5 w-5 cursor-pointer" />}
    >
      <Dropdown.Item onClick={() => setShowDelete(true)}>
        <div className="flex">
          <TrashIcon className="w-5 h-5 mr-2" />
          Delete this Tour
        </div>
      </Dropdown.Item>
      <Dropdown.Item onClick={onEdit}>
        <div className="flex">
          <PencilIcon className="w-5 h-5 mr-2" />
          Edit Tour
        </div>
      </Dropdown.Item>
    </Dropdown>
  );
};

const isSet = (value?: string | null) => {
  if (!value) return false;
  return true;
};

const TourPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data, isLoading } = trpc.useQuery(["tours.get-tour-by-id", { id }], {
    retry: false,
    refetchOnWindowFocus: false,
  });
  const [points, setPoints] = useState<Point[]>([]);

  const {data: downloadUrl } = trpc.useQuery(
    [
      "tours.get-download-url",
      {
        gpxUrl: data?.gpxUrl ?? "",
      },
    ],
    {
      enabled: isSet(data?.gpxUrl),
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
  const { mutate: deleteTourOnServer } = trpc.useMutation("tours.delete-tour", {
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
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-6 mb-4">
        <Card>
          <div className="flex justify-between">
            {isLoading && <Skeleton className="h-8 w-72"></Skeleton>}
            {!isLoading && <CardTitle title={data?.name ?? ""} />}

            <div className="flex justify-end items-center gap-3">
              {isLoading && <Spinner size="md" />}
              {!isLoading && (
                <>
                  <CommentButton tour={data!} />
                  <DownloadGpxButton downloadUrl={downloadUrl} tour={data!} />
                  {!data?.viewer && (
                    <OwnerMenu onEdit={onEdit} setShowDelete={setShowDelete} />
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
          </List>
        </Card>
        <Card>
          <Map hoverPoint={hoverPoint} peaks={peaks} points={points} />
        </Card>
      </div>
      {points && points.length > 0 && (
        <ChartArea points={points} onHover={(e) => setHoverPoint(e)} />
      )}
      <ConfirmationModal
        text={
          data?.viewer
            ? "Do you really want to remove the tour? You will lose access to the data!"
            : "Do you really want to delete the tour? All data will be lost!"
        }
        show={showDelete}
        accept={deleteTour}
        acceptColor="failure"
        acceptButton={data?.viewer ? "Remove" : "Delete"}
        decline={() => setShowDelete(false)}
      />
    </>
  );
};

const TourPage = () => {
  const { status } = useSession();
  const { query } = useRouter();
  const { id } = query;
  let content: ReactNode;
  if (!id || typeof id !== "string") {
    content = <></>;
  } else {
    if (status === "unauthenticated") content = <div>Access denied</div>;
    else if (status === "loading") content = <></>;
    else content = <TourPageContent id={id} />;
  }

  return (
    <>
      <LayoutBase>{content}</LayoutBase>
    </>
  );
};

export default TourPage;
