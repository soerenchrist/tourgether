import { trpc } from "@/utils/trpc";
import { ProfileVisibility } from "@prisma/client";
import { Avatar, Badge, Button, Card, Spinner } from "flowbite-react";
import { useRouter } from "next/router";
import CardTitle from "../common/cardTitle";
import { List, ListItem } from "../common/list";
import Skeleton from "../common/skeleton";

export type CompleteProfile = {
  id: string;
  username: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  status?: string | null;
  location?: string | null;
  favoritePeak?: string | null;
  visibility: ProfileVisibility;
};

const format = (value?: string | null) => {
  if (!value) return "-";
  if (value.length === 0) return "-";
  return value;
};

const FriendshipState: React.FC<{
  id: string;
  friendship?: { state: "ACTIVE" | "PENDING" | "NO_FRIENDS" } | null;
  isLoading?: boolean;
}> = ({ id, friendship, isLoading }) => {
  const util = trpc.useContext();
  const { mutate: sendRequest } = trpc.useMutation(
    "friends.create-friendship-request",
    {
      onSuccess() {
        util.invalidateQueries("friends.check-friendship-state");
      },
    }
  );
  const handleClick = () => {
    sendRequest({
      userId: id,
    });
  };
  if (!friendship || isLoading) return <Spinner />;
  else if (friendship.state === "ACTIVE")
    return (
      <Badge size="xl" color="success">
        You are friends!
      </Badge>
    );
  else if (friendship.state === "PENDING")
    return <Badge size="xl">Request pending</Badge>;
  return <Button onClick={handleClick}>Send friend request</Button>;
};

const ProfileOverview: React.FC<{
  profile?: CompleteProfile;
  showEdit?: boolean;
  isLoading: boolean;
  showFriendshipOption?: boolean;
}> = ({ profile, showEdit, isLoading, showFriendshipOption }) => {
  const { data: friendshipState, isLoading: stateLoading } = trpc.useQuery(
    [
      "friends.check-friendship-state",
      {
        userId: profile?.id ?? "",
      },
    ],
    {
      enabled: showFriendshipOption && profile != null,
    }
  );

  const router = useRouter();
  return (
    <Card>
      <div className="flex flex-col h-full justify-start">
        <div className="flex justify-between">
          <div className="flex justify-start gap-6">
            {isLoading && <Skeleton className="w-16 h-16"></Skeleton>}
            {profile && <Avatar img={profile.image!} size="lg" />}
            <div>
              {isLoading && <Skeleton className="w-32 h-6"></Skeleton>}
              {profile && <CardTitle title={profile.username} />}
              {isLoading && <Skeleton className="mt-2 w-16 h-4"></Skeleton>}
              {profile && <span className="text-sm">{profile.email}</span>}
            </div>
          </div>
          <div className="hidden lg:block">
            {showFriendshipOption && profile && (
              <FriendshipState
                id={profile.id}
                isLoading={stateLoading}
                friendship={friendshipState}
              />
            )}
          </div>
        </div>
        <div className="lg:hidden flex justify-start pt-4 ">
          {showFriendshipOption && profile && (
            <FriendshipState
              id={profile.id}
              isLoading={stateLoading}
              friendship={friendshipState}
            />
          )}
        </div>
        <List className="mt-4">
          <ListItem
            isLoading={isLoading}
            subtitle="Name"
            title={format(profile?.name)}
          />
          <ListItem
            isLoading={isLoading}
            subtitle="Location"
            title={format(profile?.location)}
          />
          <ListItem
            isLoading={isLoading}
            subtitle="Status"
            title={format(profile?.status)}
          />
          <ListItem
            isLoading={isLoading}
            subtitle="Favorite Peak"
            title={format(profile?.favoritePeak)}
          />
          <ListItem
            isLoading={isLoading}
            subtitle="Profile visibility"
            title={profile?.visibility === "PUBLIC" ? "Public" : "Private"}
          />
        </List>
        <div className="w-full flex justify-end pt-4">
          {showEdit && (
            <Button onClick={() => router.push("/profile/update")}>
              Edit profile
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ProfileOverview;
