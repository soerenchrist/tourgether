import { TotalsContainer } from "@/components/stats/totalsDisplay";
import LayoutBase from "@/components/layout/layoutBase";
import ProfileOverview from "@/components/profile/profileOverview";
import { trpc } from "@/utils/trpc";
import { NextPage } from "next";
import { Session } from "next-auth";
import {
  PageProps,
  protectedServersideProps,
} from "@/server/common/protectedServersideProps";
import Meta from "@/components/common/meta";

const ProfilePageContent: React.FC<{ session: Session }> = ({ session }) => {
  if (!session.user) return null;
  const { data: profile, isLoading } = trpc.useQuery([
    "profile.get-my-profile",
  ]);

  return (
    <div className="flex flex-col gap-4">
      <ProfileOverview
        isLoading={isLoading}
        profile={profile}
        showEdit={true}
      />
      <TotalsContainer />
    </div>
  );
};

const ProfilePage: NextPage<PageProps> = ({ data }) => {
  return (
    <>
      <Meta title="Your Profile" />
      <LayoutBase session={data.session}>
        <ProfilePageContent session={data.session}></ProfilePageContent>
      </LayoutBase>
      ;
    </>
  );
};

export const getServerSideProps = protectedServersideProps;

export default ProfilePage;
