import { MouseEventHandler } from "react";

const CardTitle: React.FC<{ title: string, subtitle?: string, className?: string, onClick?: MouseEventHandler<HTMLHeadingElement> }> = ({ title, className, onClick, subtitle }) => {
  return (
    <div className="flex flex-col items-start">

      <h5 onClick={onClick} className={`text-2xl font-bold tracking-tight text-gray-900 dark:text-white ${className || ""}`}>
        {title}
      </h5>
      {subtitle &&
        <caption className="text-sm text-gray-500">{subtitle}</caption>
      }
    </div>
  );
};

export default CardTitle;
