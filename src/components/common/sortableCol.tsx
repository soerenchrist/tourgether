import { mdiArrowDown, mdiArrowUp } from "@mdi/js";
import Icon from "@mdi/react";
import { ReactNode, useMemo } from "react";

export type SortState<T> = {
  sortKey: keyof T;
  order: "asc" | "desc";
};

type Props<T extends {}> = {
  children: ReactNode,
  sortKey: keyof T,
  sortState: SortState<T>
  onSort: (sortState: SortState<T>) => void
}

export const SortableCol = <T extends {}>({children, sortState, sortKey, onSort}: Props<T>) => {
  const icon = useMemo(
    () => (sortState.order === "asc" ? mdiArrowDown : mdiArrowUp),
    [sortState]
  );

  const isSorted = useMemo(() => sortKey === sortState.sortKey, [sortKey, sortState.sortKey]);

  return (
    <div
      className="flex gap-2 items-center cursor-pointer"
      onClick={() => onSort({sortKey, order: sortState.order === "asc" ? "desc" : "asc"})}
    >
      {children}
      {isSorted && <Icon path={icon} className="w-3 h-3" />}
    </div>
  );
}


export default SortableCol;
