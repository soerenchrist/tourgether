import { TotalsContainer } from "@/components/stats/totalsDisplay";
import LayoutBase from "@/components/layout/layoutBase";
import ProfileOverview from "@/components/profile/profileOverview";
import { trpc } from "@/utils/trpc";
import { Spinner } from "flowbite-react";
import { NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import {
  PageProps,
  protectedServersideProps,
} from "@/server/common/protectedServersideProps";

const ProfilePageContent: React.FC<{ session: Session }> = ({ session }) => {
  if (!session.user) return null;
  const { data: profile, isLoading } = trpc.useQuery([
    "profile.get-my-profile",
  ]);

  if (isLoading || !profile) return <Spinner />;

  return (
    <div className="flex flex-col gap-4">
      <ProfileOverview profile={profile} showEdit={true} />
      <TotalsContainer />
    </div>
  );
};

const ProfilePage: NextPage<PageProps> = ({ data }) => {
  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <LayoutBase session={data.session}>
        <ProfilePageContent session={data.session}></ProfilePageContent>
      </LayoutBase>
      ;
    </>
  );
};

export const getServerSideProps = protectedServersideProps;

export default ProfilePage;
