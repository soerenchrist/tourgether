import LayoutBase from "@/components/layout/layoutBase";
import EditToursForm from "@/components/tours/editToursForm";
import { Spinner } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";


const CreateTourContent = () => {
  return (<EditToursForm></EditToursForm>)
};

const CreateTourPage: NextPage = () => {
  const { status } = useSession();

  let content = <CreateTourContent />;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <Spinner size="xl" />;

  return <LayoutBase>{content}</LayoutBase>;
};

export default CreateTourPage;
