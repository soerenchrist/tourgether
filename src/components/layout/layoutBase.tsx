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
    <div className="flex flex-col h-screen justify-between bg-gray-200 dark:bg-gray-700">
      <Header session={session} />
      {props.children}
      <Footer />
    </div>
  );
};

export default LayoutBase;