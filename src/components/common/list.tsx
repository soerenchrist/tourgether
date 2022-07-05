import { ReactNode } from "react";

export const ListItem: React.FC<{ title?: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => {
  return (
    <li className="py-3 sm:py-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1 min-w-0">
          {title && (
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {title}
            </p>
          )}
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