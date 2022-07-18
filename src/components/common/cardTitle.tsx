import { MouseEventHandler } from "react";

const CardTitle: React.FC<{title: string, className?: string, onClick?: MouseEventHandler<HTMLHeadingElement>}> = ({ title, className, onClick}) => {
  return (
    <h5 onClick={onClick} className={`text-2xl font-bold tracking-tight text-gray-900 dark:text-white ${className || ""}`}>
      {title}
    </h5>
  );
};

export default CardTitle;
