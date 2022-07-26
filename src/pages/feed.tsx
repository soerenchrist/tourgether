import CardTitle from "@/components/common/cardTitle";
import Skeleton from "@/components/common/skeleton";
import LayoutBase from "@/components/layout/layoutBase";
import LikeButton from "@/components/tours/likeButton";
import TrendingTours from "@/components/tours/trendingTours";
import {
  PageProps,
  protectedServersideProps,
} from "@/server/common/protectedServersideProps";
import { trpc } from "@/utils/trpc";
import { Peak, Tour, TourPeak, User } from "@prisma/client";
import { Badge, Card } from "flowbite-react";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useMemo } from "react";
import InfiniteScroll from "react-infinite-scroller";

const Map = dynamic(() => import("../components/maps/tourMap"), {
  ssr: false,
});

const TourCard: React.FC<{
  tour: Tour & { creator: User; tourPeaks: (TourPeak & { peak: Peak })[] };
  router: NextRouter;
}> = ({ tour, router }) => {
  const util = trpc.useContext();
  const { data: count, isLoading: countLoading } = trpc.useQuery([
    "likes.like-count",
    {
      tourId: tour.id,
    },
  ]);
  const handleLikesChanged = () => {
    util.invalidateQueries("likes.like-count");
  };
  const peaks = useMemo(() => tour.tourPeaks.map((t) => t.peak), [tour]);
  return (
    <div className="pb-4">
      <Card>
        <div className="flex flex-col h-full gap-2 justify-start">
          <div className="flex justify-between">
            <CardTitle
              className="cursor-pointer"
              onClick={() => router.push(`/tours/${tour.id}`)}
              title={tour.name}
            />
            <LikeButton
              tour={tour}
              onLiked={handleLikesChanged}
              onRemovedLike={handleLikesChanged}
            />
          </div>
          <span className="text-sm text-gray-600 -mt-2">
            Created by {tour.creator.name} -{" "}
            {countLoading ? (
              <Skeleton className="w-12 h-4" />
            ) : (
              <span>{count} Likes</span>
            )}
          </span>
          <div className="flex gap-2">
            {peaks.map((peak) => (
              <Badge key={peak.id}>{peak.name}</Badge>
            ))}
          </div>
          {tour.description && <span>{tour.description}</span>}
          {peaks.length > 0 && (
            <div className="h-52">
              <Map peaks={peaks} allowScrolling={false} showZoomControl={false} allowDragging={false} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

const LoadingCard = () => {
  return (
    <Card>
      <div className="flex flex-col h-full gap-2 justify-start">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-24" />

        <Skeleton className="h-52 w-full" />
      </div>
    </Card>
  );
};

const FeedPageContent = () => {
  const { data, fetchNextPage, hasNextPage, isLoading } = trpc.useInfiniteQuery(
    [
      "feed.get-feed",
      {
        limit: 10,
      },
    ],
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
  const router = useRouter();

  const tours = useMemo(
    () => data?.pages.flatMap((x) => x.tours) ?? [],
    [data]
  );

  return (
    <div className="grid lg:grid-cols-6 grid-cols-1 gap-4">
      <main className="lg:col-span-4 gap-4 col-span-1 flex flex-col justify-start">
        {tours.length === 0 && !isLoading && (
          <div className="lg:col-span-4 col-span-2">
            <Card>Nothing to see here, yet...</Card>
          </div>
        )}
        {isLoading && (
          <>
            <LoadingCard />
            <LoadingCard />
          </>
        )}
        <InfiniteScroll
          pageStart={0}
          loadMore={() => fetchNextPage()}
          hasMore={hasNextPage}
          loader={<LoadingCard key="loading" />}
        >
          {tours.map((tour) => (
            <TourCard key={tour.id} tour={tour} router={router} />
          ))}
        </InfiniteScroll>
      </main>
      <aside className="hidden h-96 lg:block lg:col-span-2 lg:static fixed z-50 top-24">
        <TrendingTours />
      </aside>
    </div>
  );
};

const FeedPage: NextPage<PageProps> = ({ data }) => {
  return (
    <>
      <Head>
        <title>Feed</title>
        <link rel="icon" href="/logo.svg" />
      </Head>
      <LayoutBase session={data.session}>
        <FeedPageContent></FeedPageContent>
      </LayoutBase>
    </>
  );
};

export const getServerSideProps = protectedServersideProps;

export default FeedPage;
