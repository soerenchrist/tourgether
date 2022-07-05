import { useSession } from "next-auth/react";
import { ReactElement } from "react";
import Footer from "./footer";
import Header from "./header";

type Props = {
  children: ReactElement;
};

const LayoutBase = (props: Props) => {
  const { data: session } = useSession();
  return (
    <div className="flex flex-col h-screen justify-between bg-gray-200 text-gray-900 dark:text-white dark:bg-gray-700">
      <Header session={session} />
      <div className="p-8 h-full flex flex-col justify-start">
        {props.children}
      </div>
      <Footer />
    </div>
  );
};

export default LayoutBase;