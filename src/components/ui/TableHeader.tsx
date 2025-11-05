import { PaginationState } from "@tanstack/react-table";
import { PageSizeSelector } from "./PageSizeSelector";
import { TableFilter } from "./TableFilter";

interface TableToolbarProps {
  // Results info
  showing: number;
  total: number;
  itemName?: string; // e.g., "parts", "orders", "cars"

  // Page size
  pagination: PaginationState;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];

  // Filter
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterPlaceholder?: string;

  // Optional custom content
  children?: React.ReactNode;
}

export function TableToolbar({
  showing,
  total,
  itemName = "items",
  pagination,
  onPageSizeChange,
  pageSizeOptions,
  filterValue,
  onFilterChange,
  filterPlaceholder,
  children,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="text-sm text-muted-foreground">
        Showing {showing} of {total} {itemName}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <PageSizeSelector
          pagination={pagination}
          onPageSizeChange={onPageSizeChange}
          options={pageSizeOptions}
        />
        <TableFilter
          value={filterValue}
          onChange={onFilterChange}
          placeholder={filterPlaceholder}
        />
        {children}
      </div>
    </div>
  );
}
