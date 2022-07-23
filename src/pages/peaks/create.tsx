import LayoutBase from "@/components/layout/layoutBase";
import EditPeaksForm from "@/components/peaks/editPeaksForm";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";

const CreatePeakPageContent: React.FC = () => {
  return (
    <EditPeaksForm editPeak={undefined} />
  );
};

const CreatePeakPage: NextPage = () => {
  const { status } = useSession();

  let content = <CreatePeakPageContent />;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <></>;

  return (
    <>
      <Head>
        <title>Create a new peak</title>
      </Head>
      <LayoutBase>{content}</LayoutBase>
    </>
  );
};

export default CreatePeakPage;
