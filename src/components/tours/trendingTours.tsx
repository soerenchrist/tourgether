import { trpc } from "@/utils/trpc";
import { Card } from "flowbite-react";
import CardTitle from "../common/cardTitle";
import { List, ListItem } from "../common/list";

const TrendingTours = () => {
  const { data: tours, isLoading } = trpc.useQuery(["feed.get-trending", {
    count: 5
  }]);
  return (
    <div className="h-full">
      <Card style={{ height: "100%" }}>
        <div className="flex flex-col justify-start gap-2 h-full">
          <CardTitle title="Trending"></CardTitle>
          <List>
            {isLoading && (
              <ListItem
                title="Loading"
                subtitle="Loading"
                isLoading={true}
                image="Loading"
              />
            )}
            {!isLoading && tours?.length === 0 && (
              <span>No trending tours...</span>
            )}
            {tours?.map((tour) => (
              <ListItem
                key={tour.id}
                title={tour.name}
                subtitle={`${tour.creator.name} - ${tour._count?.likes ?? 0} Likes`}
                image={tour.creator.image}
              />
            ))}
          </List>
        </div>
      </Card>
    </div>
  );
};

export default TrendingTours;
