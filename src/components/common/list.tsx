import { ReactNode } from "react";
import Skeleton from "./skeleton";

export const ListItem: React.FC<{ title?: string | ReactNode; subtitle?: string, isLoading?: boolean }> = ({
  title,
  subtitle,
  isLoading
}) => {
  return (
    <li className="py-2">
      <div className="flex items-center space-x-4">
        <div className="flex-1 min-w-0">
          {title && !isLoading && (
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {title}
            </div>
          )}
          {
            isLoading &&
              <Skeleton className="w-52 h-5"></Skeleton>
          }
          {subtitle && (
            <p className="text-sm text-gray-500 truncat dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </li>
  );
};

export const List: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  return (
    <div className={`flow-root ${className ? className : ""}`}>
      <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
        {children}
      </ul>
    </div>
  );
};
