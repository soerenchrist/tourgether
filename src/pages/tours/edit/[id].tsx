import LayoutBase from "@/components/layout/layoutBase";
import EditToursForm from "@/components/tours/editToursForm";
import {
  PageProps,
  protectedServersideProps,
} from "@/server/common/protectedServersideProps";
import { trpc } from "@/utils/trpc";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactNode } from "react";

const EditTourPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data } = trpc.useQuery(["tours.get-tour-by-id", { id }]);

  return <div>{data && <EditToursForm editTour={data}></EditToursForm>}</div>;
};

const EditTourPage: NextPage<PageProps> = ({ data }) => {
  const { query } = useRouter();
  const { id } = query;

  if (!id || typeof id !== "string") {
    return <div>No ID</div>;
  }

  return (
    <>
      <Head>
        <title>Edit Tour</title>
      </Head>
      <LayoutBase session={data.session}>
        <EditTourPageContent id={id}></EditTourPageContent>
      </LayoutBase>
    </>
  );
};

export const getServerSideProps = protectedServersideProps;

export default EditTourPage;
