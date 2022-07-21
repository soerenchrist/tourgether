import NotFound from "@/components/common/notFound";
import TotalsDisplay from "@/components/dashboard/totalsDisplay";
import LayoutBase from "@/components/layout/layoutBase";
import ProfileOverview from "@/components/profile/profileOverview";
import { trpc } from "@/utils/trpc";
import { Spinner } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactNode } from "react";

const FriendsProfileContent: React.FC<{ id: string }> = ({ id }) => {
  const {
    data: profile,
    isError,
    isLoading,
  } = trpc.useQuery([
    "profile.get-profile",
    {
      userId: id,
    },
  ]);

  const { data: totals, isLoading: totalsLoading } = trpc.useQuery([
    "tours.get-totals",
    {
      userId: id,
    },
  ]);

  if (isLoading) return <Spinner size="xl" />;
  else if (isError) return <NotFound message="This user does not exist!" />;
  else if (!profile) return <></>
  return (
    <div className="flex flex-col gap-4">
      <ProfileOverview profile={profile} />
      <TotalsDisplay isLoading={totalsLoading} totals={totals} />
    </div>
  );
};

const FriendsProfilePage: NextPage = () => {
  const { status } = useSession();

  const { query } = useRouter();
  const { id } = query;

  let content: ReactNode;
  if (!id || typeof id !== "string") {
    content = <></>;
  } else if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <></>;
  else content = <FriendsProfileContent id={id}></FriendsProfileContent>;

  return (
    <>
      <Head>
        <title>Profile</title>
      </Head>
      <LayoutBase>{content}</LayoutBase>;
    </>
  );
};

export default FriendsProfilePage;
