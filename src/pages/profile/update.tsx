import CardTitle from "@/components/common/cardTitle";
import LayoutBase from "@/components/layout/layoutBase";
import ProfileForm from "@/components/profile/profileForm";
import { trpc } from "@/utils/trpc";
import { Card, Spinner } from "flowbite-react";
import { NextPage } from "next";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { ReactNode } from "react";

const UpdateProfilePageContent: React.FC<{ session: Session }> = ({
  session,
}) => {
  if (!session.user) return null;
  const { data: profile, isLoading } = trpc.useQuery([
    "profile.get-my-profile",
  ]);

  if (isLoading || !profile) return <Spinner />;


  return (
    <Card>
      <CardTitle title="Update profile" />
      <ProfileForm profile={profile}></ProfileForm>
    </Card>
  );
};

const UpdateProfilePage: NextPage = () => {
  const { data, status } = useSession();

  let content: ReactNode;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <></>;
  else if (data)
    content = (
      <UpdateProfilePageContent session={data!}></UpdateProfilePageContent>
    );
  else content = <></>;

  return (
    <>
      <Head>
        <title>Update Profile</title>
      </Head>
      <LayoutBase>{content}</LayoutBase>;
    </>
  );
};

export default UpdateProfilePage;
