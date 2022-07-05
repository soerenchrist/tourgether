import { ReactNode } from "react";

type Props = {
  children?: ReactNode | JSX.Element;
  title?: string;
};

const Card = ({ children, title }: Props) => {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200 sm:p-6 lg:p-8 dark:bg-gray-800 dark:border-gray-700">
      {title && <h5 className="text-xl font-medium text-gray-900 dark:text-white">{title}</h5>}
      {children}
    </div>
  );
};

export default Card;
