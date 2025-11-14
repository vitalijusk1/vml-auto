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
import { useState, useMemo, useCallback, useEffect } from "react";
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
import { Pagination } from "@/components/ui/Pagination";
import { LayoutType } from "../filters/type";
import { CarTableColumns } from "./components/CarTableColumns";
import { PartTableColumns } from "./components/PartTableColumns";
import { DetailModal } from "../modals/DetailModal";

type TableType = Exclude<LayoutType, "analytics">;

interface ServerPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface TableProps<T extends Car | Part> {
  type: TableType;
  data: T[];
  title?: string;
  serverPagination?: ServerPagination;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function Table<T extends Car | Part>({
  type,
  data,
  title,
  serverPagination,
  onPageChange,
  onPageSizeChange,
}: TableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Use server-side pagination if provided, otherwise use client-side
  const isServerSide = !!serverPagination;
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: serverPagination ? serverPagination.current_page - 1 : 0,
    pageSize: serverPagination ? serverPagination.per_page : 50,
  });
  const [selectedItem, setSelectedItem] = useState<T | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync pagination state when serverPagination changes
  useEffect(() => {
    if (isServerSide && serverPagination) {
      setPagination({
        pageIndex: serverPagination.current_page - 1,
        pageSize: serverPagination.per_page,
      });
    }
  }, [
    isServerSide,
    serverPagination?.current_page,
    serverPagination?.per_page,
  ]);

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
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === "function" ? updater(pagination) : updater;
      setPagination(newPagination);

      // If server-side pagination, trigger page change
      if (isServerSide && onPageChange) {
        onPageChange(newPagination.pageIndex + 1);
      }
    },
    manualPagination: isServerSide,
    pageCount:
      isServerSide && serverPagination ? serverPagination.last_page : undefined,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  return (
    <div className="space-y-4">
      {title && (
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
        </div>
      )}

      {/* Table Wrapper with Border */}
      <div className="rounded-md border border-border bg-white overflow-hidden px-3">
        {/* Table Toolbar */}
        <div className="py-3">
          <TableToolbar
            showing={
              isServerSide && serverPagination
                ? Math.min(
                    (serverPagination.current_page - 1) *
                      serverPagination.per_page +
                      data.length,
                    serverPagination.total
                  )
                : table.getRowModel().rows.length
            }
            total={
              isServerSide && serverPagination
                ? serverPagination.total
                : data.length
            }
            pagination={pagination}
            onPageSizeChange={(pageSize: number) => {
              if (isServerSide && onPageSizeChange) {
                onPageSizeChange(pageSize);
              } else {
                setPagination({
                  ...pagination,
                  pageSize,
                  pageIndex: 0,
                });
              }
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto my-3">
          <div className="rounded-md border border-border">
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
                    Rezultatų nėra.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </BaseTable>
          </div>
        </div>

        {/* Pagination Section */}
        <div className="flex items-center justify-end py-3">
          {isServerSide && serverPagination ? (
            <Pagination
              currentPage={serverPagination.current_page}
              totalPages={serverPagination.last_page}
              onPageChange={(page) => {
                if (onPageChange) {
                  onPageChange(page);
                }
              }}
            />
          ) : (
            <Pagination
              currentPage={table.getState().pagination.pageIndex + 1}
              totalPages={table.getPageCount()}
              onPageChange={(page) => {
                table.setPageIndex(page - 1);
              }}
            />
          )}
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
