import CardTitle from "@/components/common/cardTitle";
import Input from "@/components/common/input";
import { List, ListItem } from "@/components/common/list";
import LayoutBase from "@/components/layout/layoutBase";
import { trpc } from "@/utils/trpc";
import { Card } from "flowbite-react";
import { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";

const SearchPageContent = () => {
  const [searchText, setSearchText] = useState("");

  const { data: profiles, isLoading } = trpc.useQuery([
    "profile.search-profiles",
    {
      searchTerm: searchText,
    },
  ], {
    enabled: searchText.length >= 3
  });
  const router = useRouter();
  const handleUserClick = (id: string) => {
    router.push(`/profile/${id}`);
  }

  return (
    <Card>
      <div className="flex flex-col gap-2 h-full justify-start">
        <CardTitle title="Search" />
        <Input
          id="search"
          placeholder="Search..."
          autoComplete="false"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        {searchText.length === 0 && (
          <span>Start searching for new friends or exciting tours.</span>
        )}
        <List>
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
