import CardTitle from "@/components/common/cardTitle";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { Badge, Card } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

const ExplorePageContent = () => {
  const { data: tours } = trpc.useQuery([
    "tours.get-explore-tours",
    {
      sortMode: "RECENT",
    },
  ]);
  const router = useRouter();

  return (
    <div className="grid lg:grid-cols-4 grid-cols-2 gap-4">
      {tours?.map((tour) => (
        <Card key={tour.id}>
          <div className="flex flex-col gap-2 justify-start">
            <CardTitle className="cursor-pointer" onClick={() => router.push(`/tours/${tour.id}`)} title={tour.name} />
            <span className="text-sm text-gray-600 -mt-2">
              Created by {tour.creator.name}
            </span>
            <div className="flex gap-2">

            {tour.tourPeaks?.map(tp => (
              <Badge key={tp.id}>{tp.peak.name}</Badge>
              ))}
              </div>
            {tour.description && (
              <span>{tour.description}</span>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

const ExplorePage: NextPage = () => {
  const { status } = useSession();

  let content = <ExplorePageContent></ExplorePageContent>;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <></>;

  return <LayoutBase>{content}</LayoutBase>;
};

export default ExplorePage;
