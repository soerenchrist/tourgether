import CardTitle from "@/components/common/cardTitle";
import ProfileForm from "@/components/profile/profileForm";
import {
  PageProps,
  redirectOnboardedProps,
} from "@/server/common/protectedServersideProps";
import { trpc } from "@/utils/trpc";
import { Card, Spinner } from "flowbite-react";
import { NextPage } from "next";
import { Session } from "next-auth";
import Head from "next/head";
import { useRouter } from "next/router";

const OnboardingPageContent: React.FC<{ session: Session }> = ({ session }) => {
  const router = useRouter();
  const { data: onboarded } = trpc.useQuery(["profile.has-onboarded"], {
    onSuccess: (data) => {
      if (data.hasOnboarded) router.push("/");
    },
    refetchOnWindowFocus: false,
  });
  const { data: profile, isLoading } = trpc.useQuery(
    ["profile.get-my-profile"],
    {
      enabled: onboarded?.hasOnboarded === false,
      refetchOnWindowFocus: false,
    }
  );

  if (isLoading || !profile) return <Spinner />;

  if (!session.user) return <></>;
  return (
    <Card>
      <CardTitle title="Create your profile"></CardTitle>
      <ProfileForm profile={profile} callbackUrl="/dashboard"></ProfileForm>
    </Card>
  );
};

const OnboardingPage: NextPage<PageProps> = ({ data }) => {
  return (
    <>
      <Head>
        <title>Create your profile</title>
      </Head>
      <div className="lg:p-8 bg-gray-200 h-screen md:p-4 p-2 xl:p-8 flex-1 flex flex-col justify-start">
        <OnboardingPageContent session={data.session} />
      </div>
    </>
  );
};

export const getServerSideProps = redirectOnboardedProps;

export default OnboardingPage;
