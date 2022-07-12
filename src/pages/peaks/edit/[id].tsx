import LayoutBase from "@/components/layout/layoutBase";
import EditPeaksForm from "@/components/peaks/editPeaksForm";
import { trpc } from "@/utils/trpc";
import { Spinner } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactNode } from "react";

const EditPeak: React.FC<{ id: string }> = ({ id }) => {
  const { data } = trpc.useQuery(["peaks.get-peak-by-id", { id }]);

  return (
    <div>
    {data && <EditPeaksForm editPeak={data}></EditPeaksForm>}
    </div>  
  );
};

const EditPeakPage: NextPage = () => {
  const { status } = useSession();
  const { query } = useRouter();
  const { id } = query;

  let content: ReactNode;
  if (!id || typeof id !== "string") {
    content = <div>No ID</div>;
  } else {
    if (status === "unauthenticated") content = <div>Access denied</div>;
    else if (status === "loading") content = <Spinner size="xl"></Spinner>;
    else content = <EditPeak id={id} />;
  }

  return <LayoutBase>{content}</LayoutBase>;
};

export default EditPeakPage;
