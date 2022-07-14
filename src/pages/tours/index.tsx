import { NextPage } from "next";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { Button, Card, Pagination, Spinner } from "flowbite-react";
import { useSession } from "next-auth/react";
import { Tour } from "@prisma/client";
import CardTitle from "@/components/common/cardTitle";
import { useState } from "react";
import ToursTable from "@/components/tours/toursTable";
import PaginationText from "@/components/common/paginationText";

const PaginatedToursTable: React.FC<{
  isLoading: boolean;
  page: number;
  count: number;
  totalCount: number;
  totalPages: number;
  setPage: (page: number) => void;
  data: Tour[] | undefined;
}> = ({ isLoading, data, count, totalCount, setPage, totalPages, page }) => {
  const router = useRouter();

  const handleAddClick = () => {
    router.push("/tours/create");
  };

  return (
    <Card>
      <CardTitle title="Your Tours" />
      <ToursTable tours={data} isLoading={isLoading} />

      <div className="flex justify-between p-2 items-center">
        <div>
          <PaginationText
            from={(page - 1) * count}
            to={(page - 1) * count + (data?.length ?? 0)}
            total={totalCount}
          />
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>

        <div className="mt-2">
          <Button size="sm" onClick={handleAddClick}>
            Add a new Tour
          </Button>
        </div>
      </div>
    </Card>
  );
};

const ToursPage: NextPage = () => {
  const [page, setPage] = useState(1);
  const count = 20;
  const { data, isLoading } = trpc.useQuery([
    "tours.get-tours",
    {
      count,
      page: page,
    },
  ]);
  const { status } = useSession();

  const totalPages = Math.ceil((data?.totalCount ?? 1) / count);

  let content = (
    <PaginatedToursTable
      isLoading={isLoading}
      page={page}
      count={count}
      totalCount={data?.totalCount ?? 0}
      setPage={setPage}
      totalPages={totalPages}
      data={data?.tours}
    ></PaginatedToursTable>
  );
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <Spinner size="xl" />;

  return <LayoutBase>{content}</LayoutBase>;
};

export default ToursPage;
