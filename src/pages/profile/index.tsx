import LayoutBase from "@/components/layout/layoutBase";
import ProfileOverview from "@/components/profile/profileOverview";
import { trpc } from "@/utils/trpc";
import { Spinner } from "flowbite-react";
import { NextPage } from "next";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { ReactNode } from "react";

const ProfilePageContent: React.FC<{ session: Session }> = ({ session }) => {
  if (!session.user) return null;
  const { data: profileInfo, isLoading } = trpc.useQuery([
    "profile.get-my-profile",
  ]);

  if (isLoading) return <Spinner />;

  const profile = {
    name: session.user.name ?? "",
    email: session.user.email ?? "",
    image: session.user.image,
    status: profileInfo?.status,
    favoritePeak: profileInfo?.favoritePeak,
    location: profileInfo?.location,
  };

  return <ProfileOverview profile={profile} />;
};

const ProfilePage: NextPage = () => {
  const { data, status } = useSession();

  let content: ReactNode;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <></>;
  else if (data)
    content = <ProfilePageContent session={data!}></ProfilePageContent>;
  else content = <></>;

  return <LayoutBase>{content}</LayoutBase>;
};

export default ProfilePage;
