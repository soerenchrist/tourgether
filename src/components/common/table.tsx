import { ReactNode } from "react";

type Props = {
  headerContent: ReactNode;
  children: ReactNode;
  footerContent?: ReactNode;
  className?: string
};

export const TableRow = ({ children }: { children: ReactNode }) => {
  return (
    <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
      {children}
    </tr>
  );
};

export const TableCell = ({ children, className }: { children?: ReactNode, className?: string }) => {
  return (
    <td className={`px-6 py-4 ${className || ""}`}>{children}</td>
  );
};

export const TableHeaderCell = ({ children, className }: { children?: ReactNode, className?: string }) => {
  return (
    <th className={`px-6 py-3 ${className || ""}`}>{children}</th>
  );
};

const Table = (props: Props) => {
  return (
    <div className={`relative overflow-x-auto shadow-md rounded-lg ${props.className || ""}`}>
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-400">
          {props.headerContent}
        </thead>
        <tbody>
          {props.children}
        </tbody>
        {props.footerContent && <tfoot className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-900 dark:text-gray-400">
          {props.footerContent}
        </tfoot>}
      </table>
    </div>
  );
};

export default Table;
