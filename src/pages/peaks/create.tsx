import LayoutBase from "@/components/layout/layoutBase";
import EditPeaksForm from "@/components/peaks/editPeaksForm";
import { Spinner } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";

const CreatePeakPageContent: React.FC = () => {
  return (
    <EditPeaksForm editPeak={undefined} />
  );
};

const CreatePeakPage: NextPage = () => {
  const { status } = useSession();

  let content = <CreatePeakPageContent />;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <Spinner size="xl" />;

  return <LayoutBase>{content}</LayoutBase>;
};

export default CreatePeakPage;