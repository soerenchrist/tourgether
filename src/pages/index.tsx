import Meta from "@/components/common/meta";
import { redirectToFeedProps } from "@/server/common/protectedServersideProps";
import { Card } from "flowbite-react";
import LayoutBase from "../components/layout/layoutBase";

const Home = () => {
  return (
    <>
      <Meta></Meta>
      <LayoutBase session={null}>
        <main className="flex flex-col items-center justify-center h-full p-10 px-0 mx-auto md:py-10 md:p-10 md:px-0">
          <div className="flex items-center gap-4">
          <img className="w-32" src="logo.svg" />
          <h1 className="font-extrabold text-center lg:text-7xl text-4xl">
            Tour<span className="text-brand">gether</span>
          </h1>
          </div>

          <h3 className="items-center m-5 lg:text-3xl text-xl text-center">
            Plan and manage your hiking tours together
          </h3>
          <div className="grid grid-cols-1 grid-rows-3 lg:grid-rows-2 md:grid-rows-2 justify-center items-center lg:grid-cols-2 md:grid-cols-2 gap-3 pt-3 w-full lg:w-2/3 md:w-full">
            <Card>
              <h2 className="text-lg text-gray-700">Upload your Tracks</h2>
              <p className="text-sm text-gray-600">
                Upload your GPX Tracks and visualize them with maps and graphs!
              </p>
            </Card>
            <Card>
              <h2 className="text-lg text-gray-700">Discover Peaks</h2>
              <p className="text-sm text-gray-600">
                Discover more than 20.000 different peaks and add them to your wish list.
              </p>
            </Card>
            <Card>
              <h2 className="text-lg text-gray-700">Connect with your Friends</h2>
              <p className="text-sm text-gray-600">
                Explore the tours of your friends or find interesting routes from the whole the world!
              </p>
            </Card>
            <Card>
              <h2 className="text-lg text-gray-700">Get exciting insights</h2>
              <p className="text-sm text-gray-600">
                Check out all of your most exciting stats and compete with your friends!
              </p>
            </Card>
          </div>
        </main>
      </LayoutBase>
    </>
  );
};

export const getServerSideProps = redirectToFeedProps;

export default Home;
