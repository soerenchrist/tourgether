import CardTitle from "@/components/common/cardTitle";
import { List, ListItem } from "@/components/common/list";
import LayoutBase from "@/components/layout/layoutBase";
import CreateInvitationButton from "@/components/tours/createInvitationButton";
import { trpc } from "@/utils/trpc";
import { Card, Spinner } from "flowbite-react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactNode } from "react";

const Map = dynamic(() => import("../../components/maps/tourMap"), {
  ssr: false,
});

const TourPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data, isLoading } = trpc.useQuery(["tours.get-tour-by-id", { id }]);
  const { data: tracks } = trpc.useQuery([
    "tracks.get-tracks-for-tour",
    { id },
  ]);

  if (!data) return <div>Tour not found...</div>;

  const loadingIndicator = (
    <div className="w-full flex justify-center p-8">
      <Spinner size="xl"></Spinner>
    </div>
  );

  return (
    <>
      <Head>
        <title>Tour - {data.name}</title>
      </Head>
      <LayoutBase>
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardTitle title={data.name} />
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
                  <ListItem
                    title={`${data.startTime}`}
                    subtitle="Start time"
                  />
                )}

                {data.endTime && (
                  <ListItem
                    title={`${data.endTime}`}
                    subtitle="End time"
                  />
                )}

                <ListItem subtitle={data.description} />
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
      </LayoutBase>
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
    if (status === "unauthenticated") content = <div>Access denied</div>
    else if (status === "loading") content = <Spinner size="xl"></Spinner>
    else content = <TourPageContent id={id} />
  }

  return <LayoutBase>
    {content}
  </LayoutBase>
};

export default TourPage;
