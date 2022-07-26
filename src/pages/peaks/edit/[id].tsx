import LayoutBase from "@/components/layout/layoutBase";
import EditPeaksForm from "@/components/peaks/editPeaksForm";
import {
  PageProps,
  protectedServersideProps,
} from "@/server/common/protectedServersideProps";
import { trpc } from "@/utils/trpc";
import { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";

const EditPeakPageContent: React.FC<{ id: string }> = ({ id }) => {
  const { data } = trpc.useQuery(["peaks.get-peak-by-id", { id }]);

  return <div>{data && <EditPeaksForm editPeak={data}></EditPeaksForm>}</div>;
};

const EditPeakPage: NextPage<PageProps> = ({ data }) => {
  const { query } = useRouter();
  const { id } = query;

  if (!id || typeof id !== "string") {
    return <div>No ID</div>;
  }
  return (
    <>
      <Head>
        <title>Edit peak</title>
      </Head>
      <LayoutBase session={data.session}>
        <EditPeakPageContent id={id} />
      </LayoutBase>
    </>
  );
};

export const getServerSideProps = protectedServersideProps;

export default EditPeakPage;
