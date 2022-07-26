import CardTitle from "@/components/common/cardTitle";
import LayoutBase from "@/components/layout/layoutBase";
import ProfileForm from "@/components/profile/profileForm";
import {
  PageProps,
  protectedServersideProps,
} from "@/server/common/protectedServersideProps";
import { trpc } from "@/utils/trpc";
import { Card, Spinner } from "flowbite-react";
import { NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";

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

const UpdateProfilePage: NextPage<PageProps> = ({ data }) => {
  return (
    <>
      <Head>
        <title>Update Profile</title>
      </Head>
      <LayoutBase session={data.session}>
        <UpdateProfilePageContent
          session={data.session}
        ></UpdateProfilePageContent>
      </LayoutBase>
      ;
    </>
  );
};

export const getServerSideProps = protectedServersideProps;

export default UpdateProfilePage;
