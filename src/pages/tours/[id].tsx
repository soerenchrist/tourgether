import CardTitle from "@/components/common/cardTitle";
import { List, ListItem } from "@/components/common/list";
import LayoutBase from "@/components/layout/layoutBase";
import CreateInvitationButton from "@/components/tours/createInvitationButton";
import { trpc } from "@/utils/trpc";
import { Button, Card, Dropdown, Modal, Spinner } from "flowbite-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";
import { MenuIcon } from "@heroicons/react/solid";

const Map = dynamic(() => import("../../components/maps/tourMap"), {
  ssr: false,
});

const DeleteConfirmModal: React.FC<{show: boolean, accept: () => void, decline: () => void}> = ({show, accept, decline}) => {
  return (
    <Modal show={show} onClose={decline}>
      <Modal.Header>Are you sure?</Modal.Header>
      <Modal.Body>
        <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
          Do you really want to delete the tour? All data will be lost?
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={accept} color="failure">Delete</Button>
        <Button onClick={decline} outline color="light">Cancel</Button>
      </Modal.Footer>
    </Modal>
  );
}

const TourPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data, isLoading } = trpc.useQuery(["tours.get-tour-by-id", { id }]);
  const { data: tracks } = trpc.useQuery([
    "tracks.get-tracks-for-tour",
    { id },
  ]);
  const router = useRouter();
  const { mutate: deleteTourOnServer } = trpc.useMutation("tours.delete-tour", {
    onSuccess: () => {
      router.push("/tours");
    }
  });
  const [showDelete, setShowDelete] = useState(false);

  if (!data) return <div>Tour not found...</div>;

  const loadingIndicator = (
    <div className="w-full flex justify-center p-8">
      <Spinner size="xl"></Spinner>
    </div>
  );

  const deleteTour = () => {
    deleteTourOnServer({ id })
  }

  return (
    <>
      <Head>
        <title>Tour - {data.name}</title>
      </Head>
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <div className="flex justify-between">
            <CardTitle title={data.name} />
            {!data.viewer &&
            <Dropdown
              inline={true}
              arrowIcon={false}
              label={<MenuIcon className="h-5 w-5 cursor-pointer" />}
            >
              <Dropdown.Item onClick={() => setShowDelete(true)}>Delete this Tour</Dropdown.Item>
            </Dropdown>}
          </div>

          {isLoading ? (
            loadingIndicator
          ) : (
            <List className="mt-4">
              <ListItem title={`${data.distance}m`} subtitle="Distance" />
              <ListItem
                title={`${data.elevationUp}m`}
                subtitle="Elevation Up"
              />
              <ListItem
                title={`${data.elevationDown}m`}
                subtitle="Elevation Down"
              />
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
                  title={data.viewers.map((x) => x.viewerId).join(", ")}
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
        {((tracks && tracks.length > 0) || isLoading) && (
          <Card>
            <Map tracks={tracks} />
          </Card>
        )}
      </div>
      <DeleteConfirmModal show={showDelete} accept={deleteTour} decline={() => setShowDelete(false)} />
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
