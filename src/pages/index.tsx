import TotalsDisplay from "@/components/dashboard/totalsDisplay";
import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import LayoutBase from "../components/layout/layoutBase";

const Home: NextPage = () => {
  const session = useSession();
  return (
    <>
      <Head>
        <title>Tourgether</title>
        <meta
          name="description"
          content="Plan and manage your hiking tours together"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <LayoutBase>
        {session.status === "authenticated" && <TotalsDisplay />}
        {session.status !== "authenticated" && (
          <main className="flex flex-col items-center justify-center h-full p-10 px-0 mx-auto md:py-20 md:p-10 md:px-0">
            <h1 className="font-extrabold text-center text-7xl">
              Tour<span className="text-blue-500">gether</span>
            </h1>

            <h3 className="items-center m-5 text-3xl">
              Plan and manage your hiking tours together
            </h3>
          </main>
        )}
      </LayoutBase>
    </>
  );
};

export default Home;
