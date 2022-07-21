import { Avatar } from "flowbite-react";
import { ReactNode } from "react";
import Skeleton from "./skeleton";

export const ListItem: React.FC<{
  title?: string | ReactNode;
  subtitle?: string;
  image?: string | null;
  onTitleClick?: () => void;
  onImageClick?: () => void;
  isLoading?: boolean;
  action?: ReactNode;
}> = ({
  title,
  subtitle,
  image,
  isLoading,
  onImageClick,
  onTitleClick,
  action,
}) => {
  return (
    <li className="py-2">
      <div className="flex items-center space-x-4">
        {image && (
          <div>
            <Avatar
              img={image}
              size="md"
              onClick={() => {
                if (onImageClick) onImageClick();
              }}
              style={{ cursor: onImageClick ? "pointer" : "auto" }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && !isLoading && (
            <div
              style={{ cursor: onTitleClick ? "pointer" : "auto" }}
              className="text-sm font-medium text-gray-900 dark:text-white"
              onClick={() => {
                if (onTitleClick) onTitleClick();
              }}
            >
              {title}
            </div>
          )}
          {isLoading && <Skeleton className="w-52 h-5"></Skeleton>}
          {subtitle && (
            <p className="text-sm text-gray-500 truncat dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
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
