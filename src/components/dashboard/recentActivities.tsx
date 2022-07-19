import { Interaction } from "@/server/router/friends";
import { trpc } from "@/utils/trpc";
import { Tour, User } from "@prisma/client";
import { Avatar, Card, Dropdown, Pagination, Spinner } from "flowbite-react";
import Link from "next/link";
import { NextRouter, useRouter } from "next/router";
import { useMemo, useState } from "react";
import CardTitle from "../common/cardTitle";

export const TourItem: React.FC<{
  tour: Tour & { creator: User };
  router: NextRouter;
}> = ({ tour, router }) => {
  return (
    <li className="py-3 sm:py-4">
      <div className="flex items-center space-x-4">
        <Avatar
          alt="User settings"
          img={tour.creator.image ?? undefined}
          rounded={true}
          onClick={() => router.push(`/profile/${tour.creatorId}`)}
          style={{ cursor: "pointer" }}
        />
        <div className="flex-1 min-w-0">
          <Link href={`/tours/${tour.id}`}>
            <div className="text-sm text-gray-900 dark:text-white cursor-pointer">
              {tour.creator.name} created the tour{" "}
              <span className="font-medium">{tour.name}</span>
            </div>
          </Link>
          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
            {tour.date.toLocaleDateString()}
          </p>
        </div>
      </div>
    </li>
  );
};

export const InteractionItem: React.FC<{ interaction: Interaction, router: NextRouter }> = ({
  interaction,
  router,
}) => {
  return (
    <li className="py-3 sm:py-4">
      <div className="flex items-center space-x-4">
        <Avatar
          alt="User avatar"
          img={interaction.user.image ?? undefined}
          rounded={true}
          onClick={() => router.push(`/profile/${interaction.user.id}`)}
          style={{ cursor: "pointer" }}
        />
        <div className="flex-1 min-w-0">
          <Link href={`/tours/${interaction.tour.id}`}>
            <div className="text-sm text-gray-900 dark:text-white cursor-pointer">
              {interaction.type === "comment" && (
                <span>
                  {interaction.user.name} commented on your tour{" "}
                  <span className="font-medium">{interaction.tour.name}</span>
                </span>
              )}
              {interaction.type === "like" && (
                <span>
                  {interaction.user.name} liked your tour{" "}
                  <span className="font-medium">{interaction.tour.name}</span>
                </span>
              )}
            </div>
          </Link>
          <p className="text-sm text-gray-500 truncate dark:text-gray-400">
            {interaction.date.toLocaleDateString()}
          </p>
        </div>
      </div>
    </li>
  );
};

const RecentTours: React.FC = () => {
  const [page, setPage] = useState(1);
  const count = 5;
  const router = useRouter();
  const { data: tours, isLoading } = trpc.useQuery([
    "tours.get-friends-tours",
    {
      count,
      page,
    },
  ]);
  if (isLoading) return <Spinner size="xl" />;
  if (!tours) return <></>;

  return (
    <>
      <div className="flow-root flex-1">
        <ul
          role="list"
          className="divide-y divide-gray-200 dark:divide-gray-700"
        >
          {tours.map((tour) => (
            <TourItem tour={tour} router={router} key={tour.id} />
          ))}
        </ul>
      </div>
      <Pagination
        currentPage={1}
        layout="navigation"
        totalPages={1}
        onPageChange={(p) => setPage(p)}
      />
    </>
  );
};

const RecentInteractions: React.FC = () => {
  const { data, isLoading } = trpc.useQuery([
    "friends.get-recent-interactions",
  ]);
  const router = useRouter();

  if (isLoading) return <Spinner size="xl" />;
  if (!data) return <></>;
  return (
    <>
      <div className="flow-root flex-1">
        <ul
          role="list"
          className="divide-y divide-gray-200 dark:divide-gray-700"
        >
          {data.map((interaction) => (
            <InteractionItem key={interaction.id} router={router} interaction={interaction} />
          ))}
        </ul>
      </div>
    </>
  );
};

const RecentActivities: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<"tours" | "interactions">(
    "tours"
  );

  const title = useMemo(
    () =>
      currentPage === "tours" ? "Recent activities" : "Recent interactions",
    [currentPage]
  );

  return (
    <Card>
      <div className="flex flex-col justify-start h-full">
        <Dropdown inline label={<CardTitle title={title} />}>
          <Dropdown.Item onClick={() => setCurrentPage("tours")}>
            Recent activities
          </Dropdown.Item>
          <Dropdown.Item onClick={() => setCurrentPage("interactions")}>
            Recent interactions
          </Dropdown.Item>
        </Dropdown>

        {currentPage === "tours" && <RecentTours />}
        {currentPage === "interactions" && <RecentInteractions />}
      </div>
    </Card>
  );
};

export default RecentActivities;
