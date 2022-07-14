import LayoutBase from "@/components/layout/layoutBase";
import EditToursForm from "@/components/tours/editToursForm";
import { trpc } from "@/utils/trpc";
import { Spinner } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { ReactNode } from "react";

const EditPeak: React.FC<{ id: string }> = ({ id }) => {
  const { data } = trpc.useQuery(["tours.get-tour-by-id", { id }]);

  return (
    <div>
    {data && <EditToursForm editTour={data}></EditToursForm>}
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
