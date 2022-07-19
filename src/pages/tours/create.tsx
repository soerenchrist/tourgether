import LayoutBase from "@/components/layout/layoutBase";
import EditToursForm from "@/components/tours/editToursForm";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";


const CreateTourContent = () => {
  return (<EditToursForm></EditToursForm>)
};

const CreateTourPage: NextPage = () => {
  const { status } = useSession();

  let content = <CreateTourContent />;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <></>;

  return (
    <>
      <Head>
        <title>Create a new tour</title>
      </Head>
      <LayoutBase>{content}</LayoutBase>
    </>
  );
};

export default CreateTourPage;
