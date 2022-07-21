import { Avatar, Button, Card } from "flowbite-react";
import { useRouter } from "next/router";
import CardTitle from "../common/cardTitle";
import { List, ListItem } from "../common/list";

export type CompleteProfile = {
  username: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  status?: string | null;
  location?: string | null;
  favoritePeak?: string | null;
};

const format = (value?: string | null) => {
  if (!value) return "-";
  if (value.length === 0) return "-";
  return value;
};

const ProfileOverview: React.FC<{
  profile: CompleteProfile;
  showEdit?: boolean;
}> = ({ profile, showEdit }) => {
  const router = useRouter();
  return (
    <Card>
      <div className="flex flex-col h-full justify-start">
        <div className="flex justify-between">
          <div>
            <CardTitle title={profile.username} />
            <span className="text-sm">{profile.email}</span>
          </div>
          <Avatar img={profile.image!} size="xl" />
        </div>
        <List>
          <ListItem subtitle="Name" title={format(profile.name)} />
          <ListItem subtitle="Location" title={format(profile.location)} />
          <ListItem subtitle="Status" title={format(profile.status)} />
          <ListItem
            subtitle="Favorite Peak"
            title={format(profile.favoritePeak)}
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
