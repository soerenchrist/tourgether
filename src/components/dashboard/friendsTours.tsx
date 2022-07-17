import { trpc } from "@/utils/trpc";
import { Tour, User } from "@prisma/client";
import { Avatar, Card, Pagination, Spinner, Table } from "flowbite-react";
import Link from "next/link";
import { useState } from "react";
import CardTitle from "../common/cardTitle";

export const TourItem: React.FC<{ tour: Tour & { creator: User } }> = ({
  tour,
}) => {
  return (
    <li className="py-3 sm:py-4">
      <div className="flex items-center space-x-4">
        <Avatar
          alt="User settings"
          img={tour.creator.image ?? undefined}
          rounded={true}
        />
        <div className="flex-1 min-w-0">
          <Link href={`/tours/${tour.id}`}>
            <div className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
              {tour.name}
            </div>
          </Link>
          <p className="text-sm text-gray-500 truncat dark:text-gray-400">
            {tour.creator.name}
          </p>
        </div>
        <div>{tour.date.toLocaleDateString()}</div>
      </div>
    </li>
  );
};

const FriendsTours: React.FC = () => {
  const [page, setPage] = useState(1);
  const count = 5;
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
    <Card>
      <div className="flex flex-col justify-start h-full">
        <CardTitle title="Recent activities" />
        <div className="flow-root">
          <ul
            role="list"
            className="divide-y divide-gray-200 dark:divide-gray-700"
          >
            {tours.map((tour) => (
              <TourItem tour={tour} key={tour.id} />
            ))}
          </ul>
        </div>
      </div>
      <Pagination
        currentPage={1}
        layout="navigation"
        totalPages={1}
        onPageChange={(p) => setPage(p)}
      />
    </Card>
  );
};

export default FriendsTours;
