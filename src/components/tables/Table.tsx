import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
} from "@tanstack/react-table";
import { useState, useMemo, useCallback } from "react";
import { Car, Part } from "@/types";
import {
  Table as BaseTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TableToolbar } from "@/components/ui/TableToolbar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LayoutType } from "../filters/type";
import { CarTableColumns } from "./components/CarTableColumns";
import { PartTableColumns } from "./components/PartTableColumns";
import { DetailModal } from "../modals/DetailModal";

type TableType = Exclude<LayoutType, "analytics">;

interface TableProps<T extends Car | Part> {
  type: TableType;
  data: T[];
  title?: string;
}

export function Table<T extends Car | Part>({
  type,
  data,
  title,
}: TableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleItemClick = useCallback((item: T) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const getColumns = (): ColumnDef<T>[] => {
    switch (type) {
      case LayoutType.CAR:
        return CarTableColumns(
          handleItemClick as (car: Car) => void
        ) as ColumnDef<T>[];
      case LayoutType.PARTS:
        return PartTableColumns({
          onItemClick: handleItemClick as (part: Part) => void,
        }) as ColumnDef<T>[];
      default:
        return [];
    }
  };

  const columns = useMemo(() => getColumns(), [type, handleItemClick]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  const itemName = type === LayoutType.CAR ? "cars" : "parts";

  return (
    <div className="space-y-4">
      {title && (
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
      )}

      <TableToolbar
        showing={table.getRowModel().rows.length}
        total={data.length}
        itemName={itemName}
        pagination={pagination}
        onPageSizeChange={(pageSize: number) => {
          setPagination({
            ...pagination,
            pageSize,
            pageIndex: 0,
          });
        }}
        filterValue={
          (table
            .getColumn(type === LayoutType.CAR ? "brand" : "name")
            ?.getFilterValue() as string) ?? ""
        }
        onFilterChange={(value: string) =>
          table
            .getColumn(type === LayoutType.CAR ? "brand" : "name")
            ?.setFilterValue(value)
        }
        filterPlaceholder="Filter table..."
      />

      <div className="rounded-md border">
        <BaseTable>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => handleItemClick(row.original)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </BaseTable>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DetailModal
        type={type}
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
