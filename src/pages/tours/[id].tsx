import Card from "@/components/common/card";
import { List, ListItem } from "@/components/common/list";
import Spinner from "@/components/common/spinner";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";

const Map = dynamic(() => import("../../components/maps/tourMap"), {
  ssr: false,
});

const TourPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data, isLoading } = trpc.useQuery(["tours.get-tour-by-id", { id }]);
  const { data: tracks, isLoading: tracksLoading } = trpc.useQuery([
    "tracks.get-tracks-for-tour",
    { id },
  ]);

  if (!data) return <div>Tour not found...</div>;

  const loadingIndicator = (
    <div className="w-full flex justify-center p-8">
      <Spinner></Spinner>
    </div>
  );

  return (
    <>
      <Head>
        <title>Tour - {data.name}</title>
      </Head>
      <LayoutBase>
        <div className="grid grid-cols-2 gap-6">
          <Card title={data.name}>
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
                    title={`${data.startTime.toLocaleTimeString()}`}
                    subtitle="Start time"
                  />
                )}

                {data.endTime && (
                  <ListItem
                    title={`${data.endTime.toLocaleTimeString()}`}
                    subtitle="End time"
                  />
                )}

                <ListItem subtitle={data.description} />
              </List>
            )}
          </Card>
          {((tracks && tracks.length > 0) || tracksLoading) && (
            <Card className="p-0 lg:p-0">
              <Map tracks={tracks} />
            </Card>
          )}
        </div>
      </LayoutBase>
    </>
  );
};

const TourPage = () => {
  const { query } = useRouter();
  const { id } = query;

  if (!id || typeof id !== "string") {
    return <div>No ID</div>;
  }

  return <TourPageContent id={id} />;
};

export default TourPage;
