import LayoutBase from "@/components/layout/layoutBase";
import EditToursForm from "@/components/tours/editToursForm";
import { PageProps, protectedServersideProps } from "@/server/common/protectedServersideProps";
import { NextPage } from "next";
import Head from "next/head";


const CreateTourContent = () => {
  return (<EditToursForm></EditToursForm>)
};

const CreateTourPage: NextPage<PageProps> = ({data}) => {
  return (
    <>
      <Head>
        <title>Create a new tour</title>
      </Head>
      <LayoutBase session={data.session}><CreateTourContent></CreateTourContent></LayoutBase>
    </>
  );
};
export const getServerSideProps = protectedServersideProps;

export default CreateTourPage;
