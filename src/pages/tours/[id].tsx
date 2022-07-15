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
import { Point, Visibility } from "@prisma/client";
import ChartArea from "@/components/tours/charts/chartArea";

const Map = dynamic(() => import("../../components/maps/tourMap"), {
  ssr: false,
});

const OwnerMenu: React.FC<{
  setShowDelete: (value: boolean) => void;
}> = ({ setShowDelete }) => {
  return (
    <Dropdown.Item onClick={() => setShowDelete(true)}>
      <div className="flex">
        <TrashIcon className="w-5 h-5 mr-2" />
        Delete this Tour
      </div>
    </Dropdown.Item>
  );
};

const TourPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data, isLoading } = trpc.useQuery(["tours.get-tour-by-id", { id }], {
    retry: false,
  });
  const router = useRouter();
  const [hoverPoint, setHoverPoint] = useState<Point>();
  const { mutate: deleteTourOnServer } = trpc.useMutation("tours.delete-tour", {
    onSuccess: () => {
      router.push("/tours");
    },
  });

  const [showDelete, setShowDelete] = useState(false);
  const peaks = useMemo(() => data?.tourPeaks?.map((t) => t.peak), [data])

  if (isLoading) return <Spinner size="xl" />;
  else if (!data) return <NotFound message="Tour not found!" />;

  const loadingIndicator = (
    <div className="w-full flex justify-center p-8">
      <Spinner size="xl"></Spinner>
    </div>
  );

  const deleteTour = () => {
    if (!data) return;
    deleteTourOnServer({ id });
  };

  const getVisibilityText = (visibility: Visibility) => {
      if (visibility === "FRIENDS") return "Friends only";
      else if (visibility === "PRIVATE") return "Only you";
      return "Everyone";
  }

  return (
    <>
      <Head>
        <title>Tour - {data.name}</title>
      </Head>
      <div className="grid grid-cols-2 gap-6 mb-4">
        <Card>
          <div className="flex justify-between">
            <CardTitle title={data.name ?? ""} />

            <Dropdown
              placement="top"
              inline={true}
              arrowIcon={false}
              label={<DotsVerticalIcon className="h-5 w-5 cursor-pointer" />}
            >
              {!data.viewer && (
                <OwnerMenu setShowDelete={setShowDelete} />
              )}

              <Dropdown.Item onClick={() => router.push(`/tours/edit/${id}`)}>
                <div className="flex">
                  <PencilIcon className="w-5 h-5 mr-2" />
                  Edit Tour
                </div>
              </Dropdown.Item>
            </Dropdown>
          </div>

          {isLoading ? (
            loadingIndicator
          ) : (
            <List className="mt-4">
              <ListItem title={`${data.distance} m`} subtitle="Distance" />
              <ListItem
                title={`${data.elevationUp} m`}
                subtitle="Total Ascent"
              />
              <ListItem
                title={`${data.elevationDown} m`}
                subtitle="Total Descent"
              />

              {data.tourPeaks.length > 0 && (
                <ListItem
                  title={peaks?.map((tp) => (
                    <Link href={`/peaks/${tp.id}`} key={tp.id}>
                      <span className="cursor-pointer mr-2 text-blue-500 font-medium hover:underline w-auto">
                        {tp.name} ({tp.height} m)
                      </span>
                    </Link>
                  ))}
                  subtitle="Peaks"
                />
              )}

              <ListItem
                title={`${data.date.toLocaleDateString()}`}
                subtitle="Date"
              />
              {data.startTime && (
                <ListItem title={`${data.startTime}`} subtitle="Start time" />
              )}

              {data.endTime && (
                <ListItem title={`${data.endTime}`} subtitle="End time" />
              )}

              {data.description.length > 0 && (
                <ListItem subtitle={data.description} />
              )}

              <ListItem title={getVisibilityText(data.visibility)} subtitle="Visibility"></ListItem>
            </List>
          )}
        </Card>
        <Card>
          <Map
            hoverPoint={hoverPoint}
            peaks={peaks}
            points={data?.points}
          />
        </Card>
      </div>
      {data?.points && data.points.length > 0 && (
        <ChartArea points={data.points} onHover={(e) => setHoverPoint(e)} />
      )}
      <ConfirmationModal
        text={
          data.viewer
            ? "Do you really want to remove the tour? You will lose access to the data!"
            : "Do you really want to delete the tour? All data will be lost!"
        }
        show={showDelete}
        accept={deleteTour}
        acceptColor="failure"
        acceptButton={data.viewer ? "Remove" : "Delete"}
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
    content = <div>No ID</div>;
  } else {
    if (status === "unauthenticated") content = <div>Access denied</div>;
    else if (status === "loading") content = <Spinner size="xl"></Spinner>;
    else content = <TourPageContent id={id} />;
  }

  return (
    <>
      <LayoutBase>{content}</LayoutBase>
    </>
  );
};

export default TourPage;
