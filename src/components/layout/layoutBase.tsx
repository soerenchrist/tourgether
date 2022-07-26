import { Session } from "next-auth";
import { ReactNode } from "react";
import Footer from "./footer";
import Header from "./header";

type Props = {
  children: ReactNode;
  session: Session | null
};

const LayoutBase = (props: Props) => {
  return (
    <div className="flex flex-col min-h-screen justify-between bg-gray-200 text-gray-900 dark:text-white dark:bg-gray-700">
      <Header session={props.session} />
      <div className="lg:p-8 md:p-4 p-2 xl:p-8 h-full flex-1 flex flex-col justify-start">
        {props.children}
      </div>
      <Footer />
    </div>
  );
};

export default LayoutBase;