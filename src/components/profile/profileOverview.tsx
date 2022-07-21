import { trpc } from "@/utils/trpc";
import { ProfileVisibility } from "@prisma/client";
import { Avatar, Badge, Button, Card, Spinner } from "flowbite-react";
import { useRouter } from "next/router";
import CardTitle from "../common/cardTitle";
import { List, ListItem } from "../common/list";

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
  isLoading: boolean;
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
  else if (friendship.state === "ACTIVE") return <Badge size="xl">You are friends!</Badge>
  else if (friendship.state === "PENDING")
    return <Badge size="xl">Request pending</Badge>
  return <Button onClick={handleClick}>Send friend request</Button>;
};

const ProfileOverview: React.FC<{
  profile: CompleteProfile;
  showEdit?: boolean;
  showFriendshipOption?: boolean;
}> = ({ profile, showEdit, showFriendshipOption }) => {
  const { data: friendshipState, isLoading } = trpc.useQuery(
    [
      "friends.check-friendship-state",
      {
        userId: profile.id,
      },
    ],
    {
      enabled: showFriendshipOption,
    }
  );

  const router = useRouter();
  return (
    <Card>
      <div className="flex flex-col h-full justify-start">
        <div className="flex justify-between">
          <div className="flex justify-start gap-6">
            <Avatar img={profile.image!} size="xl" />
            <div>
              <CardTitle title={profile.username} />
              <span className="text-sm">{profile.email}</span>
            </div>
          </div>
          {showFriendshipOption && (
            <FriendshipState
              id={profile.id}
              isLoading={isLoading}
              friendship={friendshipState}
            />
          )}
        </div>
        <List className="mt-4">
          <ListItem subtitle="Name" title={format(profile.name)} />
          <ListItem subtitle="Location" title={format(profile.location)} />
          <ListItem subtitle="Status" title={format(profile.status)} />
          <ListItem
            subtitle="Favorite Peak"
            title={format(profile.favoritePeak)}
          />
          <ListItem
            subtitle="Profile visibility"
            title={profile.visibility === "PUBLIC" ? "Public" : "Private"}
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
