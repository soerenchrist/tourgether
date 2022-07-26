import LayoutBase from "@/components/layout/layoutBase";
import EditPeaksForm from "@/components/peaks/editPeaksForm";
import {
  PageProps,
  protectedServersideProps,
} from "@/server/common/protectedServersideProps";
import { NextPage } from "next";
import Head from "next/head";

const CreatePeakPageContent: React.FC = () => {
  return <EditPeaksForm editPeak={undefined} />;
};

const CreatePeakPage: NextPage<PageProps> = ({ data }) => {
  return (
    <>
      <Head>
        <title>Create a new peak</title>
      </Head>
      <LayoutBase session={data.session}>
        <CreatePeakPageContent></CreatePeakPageContent>
      </LayoutBase>
    </>
  );
};

export const getServerSideProps = protectedServersideProps;

export default CreatePeakPage;
