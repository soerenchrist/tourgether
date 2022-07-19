import { Avatar, Button, Card } from "flowbite-react";
import { useRouter } from "next/router";
import CardTitle from "../common/cardTitle";
import { List, ListItem } from "../common/list";

export type CompleteProfile = {
  name: string;
  email: string;
  image?: string | null;
  status?: string | null;
  location?: string | null;
  favoritePeak?: string | null;
};

const ProfileOverview: React.FC<{ profile: CompleteProfile }> = ({ profile }) => {
  const router = useRouter();
  return (
    <Card>
      <div className="flex flex-col h-full justify-start">
        <div className="flex justify-between">
          <div>
            <CardTitle title={profile.name} />
            <span className="text-sm">{profile.email}</span>
          </div>
          <Avatar img={profile.image!} size="xl" />
        </div>
        <List>
          <ListItem subtitle="Location" title={profile.location ?? "-"} />
          <ListItem subtitle="Status" title={profile.status ?? "-"} />
          <ListItem subtitle="Favorite Peak" title={profile.favoritePeak ?? "-"} />
        </List>
        <div className="w-full flex justify-end pt-4">
          <Button onClick={() => router.push("/profile/update")}>Edit profile</Button>
        </div>
      </div>
    </Card>
  );
};

export default ProfileOverview;
