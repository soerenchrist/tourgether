import NotFound from "@/components/common/notFound";
import TotalsDisplay from "@/components/stats/totalsDisplay";
import LayoutBase from "@/components/layout/layoutBase";
import ProfileOverview from "@/components/profile/profileOverview";
import UsersTours from "@/components/profile/usersTours";
import { trpc } from "@/utils/trpc";
import { Spinner } from "flowbite-react";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect } from "react";
import {
  PageProps,
  protectedServersideProps,
} from "@/server/common/protectedServersideProps";
import Meta from "@/components/common/meta";

const FriendsProfileContent: React.FC<{ id: string }> = ({ id }) => {
  const {
    data: profile,
    isError,
    error,
    isLoading,
  } = trpc.useQuery([
    "profile.get-profile",
    {
      userId: id,
    },
  ]);
  const router = useRouter();
  useEffect(() => {
    if (error?.data?.code === "BAD_REQUEST") {
      router.push("/profile");
    }
  }, [error, router]);

  const { data: totals, isLoading: totalsLoading } = trpc.useQuery([
    "tours.get-totals",
    {
      userId: id,
    },
  ]);

  if (isError && error.data?.code === "NOT_FOUND")
    return <NotFound message="This user does not exist!" />;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProfileOverview isLoading={isLoading} profile={profile} showFriendshipOption={true} />
        {profile && <UsersTours userId={id} name={profile.username} />}
      </div>
      <TotalsDisplay isLoading={totalsLoading} totals={totals} />
    </div>
  );
};

const FriendsProfilePage: NextPage<PageProps> = ({ data }) => {
  const { query } = useRouter();
  const { id } = query;

  if (!id || typeof id !== "string") {
    return <></>;
  }

  return (
    <>
      <Meta title="Profile" />
      <LayoutBase session={data.session}>
        <FriendsProfileContent id={id}></FriendsProfileContent>
      </LayoutBase>
    </>
  );
};

export const getServerSideProps = protectedServersideProps;

export default FriendsProfilePage;
