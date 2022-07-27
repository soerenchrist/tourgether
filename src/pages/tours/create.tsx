import Meta from "@/components/common/meta";
import LayoutBase from "@/components/layout/layoutBase";
import EditToursForm from "@/components/tours/editToursForm";
import { PageProps, protectedServersideProps } from "@/server/common/protectedServersideProps";
import { NextPage } from "next";

const CreateTourContent = () => {
  return (<EditToursForm></EditToursForm>)
};

const CreateTourPage: NextPage<PageProps> = ({data}) => {
  return (
    <>
      <Meta title="Create a new Tour"></Meta>
      <LayoutBase session={data.session}><CreateTourContent></CreateTourContent></LayoutBase>
    </>
  );
};
export const getServerSideProps = protectedServersideProps;

export default CreateTourPage;
