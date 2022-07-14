import CardTitle from "@/components/common/cardTitle";
import { List, ListItem } from "@/components/common/list";
import LayoutBase from "@/components/layout/layoutBase";
import CreateInvitationButton from "@/components/tours/createInvitationButton";
import { trpc } from "@/utils/trpc";
import { Card, Dropdown, Spinner } from "flowbite-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";
import {
  DotsVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/solid";
import ConfirmDeleteModal from "@/components/common/confirmDeleteModal";
import NotFound from "@/components/common/notFound";
import Link from "next/link";
import HeightProfile from "@/components/tours/heightProfile";
import { Point } from "@prisma/client";

const Map = dynamic(() => import("../../components/maps/tourMap"), {
  ssr: false,
});

const ViewerMenu: React.FC<{
  setShowDelete: (value: boolean) => void;
}> = ({ setShowDelete }) => {
  return (
    <Dropdown.Item onClick={() => setShowDelete(true)}>
      <div className="flex">
        <TrashIcon className="w-5 h-5 mr-2" />
        Remove this Peak
      </div>
    </Dropdown.Item>
  );
};

const OwnerMenu: React.FC<{
  setShowDelete: (value: boolean) => void;
}> = ({ setShowDelete }) => {
  return (
    <Dropdown.Item onClick={() => setShowDelete(true)}>
      <div className="flex">
        <TrashIcon className="w-5 h-5 mr-2" />
        Delete this Peak
      </div>
    </Dropdown.Item>
  );
};

const ViewerItem: React.FC<{ viewer: string; tourId: string }> = ({
  viewer,
  tourId,
}) => {
  const utils = trpc.useContext();
  const { mutate: revokeAccess } = trpc.useMutation("invite.revoke-access", {
    onSuccess: () => {
      utils.invalidateQueries(["tours.get-tour-by-id"]);
    },
  });

  return (
    <div className="mr-2">
      <Dropdown
        inline
        arrowIcon={false}
        label={<span className="text-blue-500">{viewer}</span>}
      >
        <Dropdown.Item
          onClick={() => revokeAccess({ tourId, viewerId: viewer })}
        >
          Revoke access
        </Dropdown.Item>
      </Dropdown>
    </div>
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
  const { mutate: removeInvitedTour } = trpc.useMutation(
    "invite.remove-invited-tour",
    {
      onSuccess: () => {
        router.push("/tours");
      },
    }
  );

  const [showDelete, setShowDelete] = useState(false);

  if (isLoading) return <Spinner size="xl" />;
  else if (!data) return <NotFound message="Tour not found!" />;

  const loadingIndicator = (
    <div className="w-full flex justify-center p-8">
      <Spinner size="xl"></Spinner>
    </div>
  );

  const deleteTour = () => {
    if (!data) return;
    if (data.viewer) {
      removeInvitedTour({ tourId: id });
    } else {
      deleteTourOnServer({ id });
    }
  };

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
              {data.viewer ? (
                <ViewerMenu setShowDelete={setShowDelete} />
              ) : (
                <OwnerMenu setShowDelete={setShowDelete} />
              )}

              <Dropdown.Item
                onClick={() => router.push(`/tours/edit/${id}`)}
              >
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
                subtitle="Elevation Up"
              />
              <ListItem
                title={`${data.elevationDown} m`}
                subtitle="Elevation Down"
              />

              {data.tourPeaks.length > 0 && (
                <ListItem
                  title={data.tourPeaks.map((tp) => (
                    <Link href={`/peaks/${tp.peak.id}`} key={tp.id}>
                      <span className="cursor-pointer mr-2 text-blue-500 font-medium hover:underline w-auto">
                        {tp.peak.name}
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

              {data.viewers.length > 0 && (
                <ListItem
                  title={data.viewers.map((x) => (
                    <ViewerItem
                      key={x.id}
                      viewer={x.viewerId}
                      tourId={data.id}
                    />
                  ))}
                  subtitle="Shared with"
                />
              )}

              {data.viewer && (
                <ListItem title={data.creatorId} subtitle="Created by" />
              )}

              {data.description.length > 0 && (
                <ListItem subtitle={data.description} />
              )}
              {!data.viewer && <CreateInvitationButton tour={data} />}
            </List>
          )}
        </Card>
        <Card>
          <Map
            hoverPoint={hoverPoint}
            peaks={data?.tourPeaks?.map((t) => t.peak)}
            points={data?.points}
          />
        </Card>
      </div>
      {data?.points && (
        <HeightProfile points={data.points} onHover={(e) => setHoverPoint(e)} />
      )}
      <ConfirmDeleteModal
        text={
          data.viewer
            ? "Do you really want to remove the tour? You will lose access to the data!"
            : "Do you really want to delete the tour? All data will be lost!"
        }
        show={showDelete}
        accept={deleteTour}
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
