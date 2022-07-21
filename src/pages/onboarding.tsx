import CardTitle from "@/components/common/cardTitle";
import ProfileForm from "@/components/profile/profileForm";
import { trpc } from "@/utils/trpc";
import { Card, Spinner } from "flowbite-react";
import { NextPage } from "next";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactNode } from "react";

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

const OnboardingPage: NextPage = () => {
  const { status, data } = useSession();

  let content: ReactNode;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading" || !data) content = <></>;
  else content = <OnboardingPageContent session={data}></OnboardingPageContent>;

  return (
    <>
      <Head>
        <title>Create your profile</title>
      </Head>
      <div className="lg:p-8 bg-gray-200 h-screen md:p-4 p-2 xl:p-8 flex-1 flex flex-col justify-start">
        {content}
      </div>
    </>
  );
};

export default OnboardingPage;