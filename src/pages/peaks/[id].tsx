import CardTitle from "@/components/common/cardTitle";
import ConfirmDeleteModal from "@/components/common/confirmDeleteModal";
import NotFound from "@/components/common/notFound";
import LayoutBase from "@/components/layout/layoutBase";
import ToursTable from "@/components/tours/toursTable";
import { trpc } from "@/utils/trpc";
import {
  DotsVerticalIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/solid";
import { Card, Dropdown, Spinner } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { ReactNode, useState } from "react";

const Map = dynamic(() => import("../../components/maps/peakMap"), {
  ssr: false,
});

const PeakDetails: React.FC<{ id: string }> = ({ id }) => {
  const [showDelete, setShowDelete] = useState(false);
  const router = useRouter();
  const { mutate: deletePeak } = trpc.useMutation("peaks.delete-peak", {
    onSuccess: () => {
      router.push("/peaks");
    },
  });
  const { data: peak, isLoading } = trpc.useQuery([
    "peaks.get-peak-by-id",
    {
      id,
    },
  ]);
  const { data: tours, isLoading: toursLoading } = trpc.useQuery([
    "peaks.get-tours-by-peak",
    {
      peakId: id,
    },
  ]);

  console.log(tours);

  if (isLoading) {
    return <Spinner size="xl" />;
  }
  if (!peak) return <NotFound message="Peak not found..."></NotFound>;

  const onDeletePeak = () => {
    deletePeak({ id });
  };
  return (
    <>
      <Head>
        <title>Peak - {peak.name}</title>
      </Head>
      <div className="grid xl:grid-cols-2 grid-cols-1 gap-4">
        <Card>
          <div className="flex justify-between">
            <CardTitle title={`${peak.name} (${peak.height} m)`} />
            {peak.creatorId && (
              <Dropdown
                inline={true}
                arrowIcon={false}
                label={<DotsVerticalIcon className="h-5 w-5 cursor-pointer" />}
              >
                <div className="bg-white h-full w-full">
                  <Dropdown.Item onClick={() => setShowDelete(true)}>
                    <div className="flex">
                      <TrashIcon className="w-5 h-5 mr-2" />
                      Delete this Peak
                    </div>
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => router.push(`/peaks/edit/${peak.id}`)}
                  >
                    <div className="flex">
                      <PencilIcon className="w-5 h-5 mr-2" />
                      Edit Peak
                    </div>
                  </Dropdown.Item>
                </div>
              </Dropdown>
            )}
          </div>
          <Map peak={peak} />
        </Card>
        <Card>
          <div className="flex flex-col justify-start h-full gap-4">
            <CardTitle title={`Your tours to ${peak.name}`} />
            <ToursTable tours={tours} isLoading={toursLoading} />
          </div>
        </Card>
      </div>
      <ConfirmDeleteModal
        text="Do you really want to delete this peak? All data will be lost?"
        show={showDelete}
        accept={onDeletePeak}
        decline={() => setShowDelete(false)}
      />
    </>
  );
};

const PeakDetailsPage: NextPage = () => {
  const { status } = useSession();
  const { query } = useRouter();
  const { id } = query;

  let content: ReactNode;
  if (!id || typeof id !== "string") {
    content = <div>No ID</div>;
  } else {
    if (status === "unauthenticated") content = <div>Access denied</div>;
    else if (status === "loading") content = <Spinner size="xl"></Spinner>;
    else content = <PeakDetails id={id} />;
  }

  return <LayoutBase>{content}</LayoutBase>;
};

export default PeakDetailsPage;
