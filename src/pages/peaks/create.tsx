import Meta from "@/components/common/meta";
import LayoutBase from "@/components/layout/layoutBase";
import EditPeaksForm from "@/components/peaks/editPeaksForm";
import {
  PageProps,
  protectedServersideProps,
} from "@/server/common/protectedServersideProps";
import { NextPage } from "next";

const CreatePeakPageContent: React.FC = () => {
  return <EditPeaksForm editPeak={undefined} />;
};

const CreatePeakPage: NextPage<PageProps> = ({ data }) => {
  return (
    <>
      <Meta title="Create a new Peak" />
      <LayoutBase session={data.session}>
        <CreatePeakPageContent></CreatePeakPageContent>
      </LayoutBase>
    </>
  );
};

export const getServerSideProps = protectedServersideProps;

export default CreatePeakPage;
