import CardTitle from "@/components/common/cardTitle";
import Input from "@/components/common/input";
import { List, ListItem } from "@/components/common/list";
import Meta from "@/components/common/meta";
import ProgressBar from "@/components/common/progressBar";
import LayoutBase from "@/components/layout/layoutBase";
import useDebounceValue from "@/hooks/useDebounce";
import { protectedServersideProps } from "@/server/common/protectedServersideProps";
import { trpc } from "@/utils/trpc";
import { Card, Tabs } from "flowbite-react";
import { Session } from "next-auth";
import { NextRouter, useRouter } from "next/router";
import { useState } from "react";

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
      {searchTerm.length < 3 && (profiles?.length === 0 || !profiles) && (
        <span>Start searching for new friends.</span>
      )}
      {searchTerm.length > 0 && !isLoading && profiles?.length === 0 && (
        <span>Nothing found...</span>
      )}
      <List>
        {isLoading && <ListItem image={"placeholder"} isLoading={true} />}
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

const SearchPage = ({ data }: { data: { session: Session } }) => {
  return (
    <>
      <Meta title="Search"></Meta>
      <LayoutBase session={data.session}>
        <SearchPageContent></SearchPageContent>
      </LayoutBase>
    </>
  );
};

export const getServerSideProps = protectedServersideProps;

export default SearchPage;
