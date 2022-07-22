import CardTitle from "@/components/common/cardTitle";
import Input from "@/components/common/input";
import { List, ListItem } from "@/components/common/list";
import ProgressBar from "@/components/common/progressBar";
import LayoutBase from "@/components/layout/layoutBase";
import useDebounceValue from "@/hooks/useDebounce";
import { trpc } from "@/utils/trpc";
import { Card, Tabs } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { NextRouter, useRouter } from "next/router";
import { useMemo, useState } from "react";

const TourSearchArea: React.FC<{ router: NextRouter; searchTerm: string }> = ({
  router,
  searchTerm,
}) => {
  const { data: tours, isLoading } = trpc.useQuery(
    [
      "tours.search-tours",
      {
        searchTerm,
      },
    ],
    {
      enabled: searchTerm.length >= 3,
    }
  );

  const handleTourClick = (tourId: string) => {
    router.push(`/tours/${tourId}`);
  };

  return (
    <>
      {!isLoading && <div className="h-2"></div>}
      {isLoading && <ProgressBar />}
      {searchTerm.length < 3 && (tours?.length === 0 || !tours) && (
        <span>Start searching for exciting tours.</span>
      )}
      {searchTerm.length > 0 && !isLoading && tours?.length === 0 && (
        <span>Nothing found...</span>
      )}
      <List>
        {isLoading && <ListItem image={"placeholder"} isLoading={true} />}
        {tours?.map((tour) => (
          <ListItem
            key={tour.id}
            onTitleClick={() => handleTourClick(tour.id)}
            title={tour.name}
            subtitle={tour.creator.name ?? ""}
          ></ListItem>
        ))}
      </List>
    </>
  );
};

const UserSearchArea: React.FC<{ router: NextRouter; searchTerm: string }> = ({
  router,
  searchTerm,
}) => {
  const handleUserClick = (id: string) => {
    router.push(`/profile/${id}`);
  };

  const { data: profiles, isLoading } = trpc.useQuery(
    [
      "profile.search-profiles",
      {
        searchTerm: searchTerm,
      },
    ],
    {
      enabled: searchTerm.length >= 3,
    }
  );

  return (
    <>
      {!isLoading && <div className="h-2"></div>}
      {isLoading && <ProgressBar />}
      {searchTerm.length < 3 && profiles?.length === 0 && (
        <span>Start searching for new friends or exciting tours.</span>
      )}
      {searchTerm.length > 0 && !isLoading && profiles?.length === 0 && (
        <span>Nothing found...</span>
      )}
      <List>
        {(!profiles || isLoading) && (
          <ListItem image={"placeholder"} isLoading={true} />
        )}
        {profiles?.map((profile) => (
          <ListItem
            key={profile.id}
            onImageClick={() => handleUserClick(profile.id)}
            onTitleClick={() => handleUserClick(profile.id)}
            image={profile.image}
            title={profile.username}
            subtitle={profile.name}
          ></ListItem>
        ))}
      </List>
    </>
  );
};

const SearchPageContent = () => {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounceValue(searchText);
  const [activeTab, setActiveTab] = useState<"TOURS" | "USERS">("TOURS");

  const router = useRouter();
  return (
    <Card style={{ height: "60vh" }}>
      <div className="flex flex-col h-full justify-start">
        <Tabs.Group style="default">
          <Tabs.Item title="Tours" active={activeTab === "TOURS"}>
            <div className="flex flex-col gap-2 h-full justify-start">
              <CardTitle title="Search for tours" />
              <Input
                id="search"
                placeholder="Search..."
                autoComplete="off"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <TourSearchArea router={router} searchTerm={debouncedSearch} />
            </div>
          </Tabs.Item>
          <Tabs.Item
            title="Users"
            active={activeTab === "USERS"}
            onClick={() => setActiveTab("USERS")}
          >
            <div className="flex flex-col gap-2 h-full justify-start">
              <CardTitle title="Search for users" />
              <Input
                id="search"
                placeholder="Search..."
                autoComplete="off"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <UserSearchArea router={router} searchTerm={debouncedSearch} />
            </div>
          </Tabs.Item>
        </Tabs.Group>
      </div>
    </Card>
  );
};

const SearchPage: NextPage = () => {
  const { status } = useSession();

  let content = <SearchPageContent></SearchPageContent>;
  if (status === "unauthenticated") content = <p>Access denied</p>;
  else if (status === "loading") content = <></>;

  return (
    <>
      <Head>
        <title>Search members and tours</title>
      </Head>
      <LayoutBase>{content}</LayoutBase>
    </>
  );
};

export default SearchPage;
