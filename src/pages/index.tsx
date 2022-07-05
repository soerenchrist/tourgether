import type { NextPage } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Footer from "../components/footer";
import { trpc } from "../utils/trpc";

const Header = () => {
  const session = useSession();
  return (
    <header className="bg-gray-700 text-white items-center pr-6 h-14 flex justify-end">
      {session.data?.user?.email || 

      <Link href="/api/auth/signin">
        <div className="bg-blue-500 p-1 px-4 rounded-2xl">Sign in</div>
      </Link>}
    </header>
  );
};

const Home: NextPage = () => {
  const hello = trpc.useQuery(["example.hello", { text: "from tRPC" }]);

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

      <div className="flex flex-col h-screen justify-between">
        <Header />
        <main className="flex flex-col items-center justify-center h-full p-10 px-0 mx-auto md:py-20 md:p-10 md:px-0">
          <h1 className="font-extrabold text-center text-7xl">
            Tour<span className="text-blue-500">gether</span>
          </h1>

          <h3 className="items-center m-5 text-3xl">
            Plan and manage your hiking tours together
          </h3>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Home;
