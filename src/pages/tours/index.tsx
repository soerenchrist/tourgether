import { NextPage } from "next";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { useRouter } from "next/router";
import { Button, Card, Pagination, Spinner } from "flowbite-react";
import { useSession } from "next-auth/react";
import { Tour } from "@prisma/client";
import CardTitle from "@/components/common/cardTitle";
import { useEffect, useState } from "react";
import ToursTable from "@/components/tours/toursTable";
import PaginationText from "@/components/common/paginationText";
import Head from "next/head";
import useDebounceValue from "@/hooks/useDebounce";
import Input from "@/components/common/input";

const PaginatedToursTable: React.FC = () => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounceValue(searchTerm, 500);
  const count = 20;
  const { data, isLoading } = trpc.useQuery([
    "tours.get-tours",
    {
      count,
      page: page,
      searchTerm: debouncedSearchTerm,
    },
  ]);
  const totalPages = Math.ceil((data?.totalCount ?? 1) / count);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  const handleAddClick = () => {
    router.push("/tours/create");
  };

  return (
    <Card>
      <CardTitle title="Your Tours" />
      <Input
        value={searchTerm}
        autoComplete="off"
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search..."
        id="searchTours"
      />
      <ToursTable
        tours={data?.tours}
        isLoading={isLoading}
        noResultsText={
          searchTerm.length === 0
            ? "You don't have any tours yet"
            : `No tours found for search term: "${searchTerm}"`
        }
      />

      <div className="flex justify-between p-2 items-center">
        <div>
          <PaginationText
            from={(page - 1) * count}
            to={(page - 1) * count + (data?.tours.length ?? 0)}
            total={data?.totalCount ?? 0}
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
  const { status } = useSession();

  let content = <PaginatedToursTable />;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <></>;

  return (
    <>
      <Head>
        <title>My Tours</title>
      </Head>
      <LayoutBase>{content}</LayoutBase>
    </>
  );
};

export default ToursPage;
