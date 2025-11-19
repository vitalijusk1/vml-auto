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
import { useState, useMemo, useCallback, useEffect, Fragment } from "react";
import { Car, Part, Order, Return } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters, selectOrders } from "@/store/selectors";
import {
  Table as BaseTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TableToolbar } from "@/components/ui/TableToolbar";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { LayoutType } from "../filters/type";
import { PartTableColumns } from "./components/PartTableColumns";
import { OrderTableColumns } from "./components/OrderTableColumns";
import { ReturnTableColumns } from "./components/ReturnTableColumns";
import { DetailModal } from "../modals/DetailModal";

type TableType = Exclude<LayoutType, "analytics" | "order-control">;

interface ServerPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface TableProps<T extends Car | Part | Order | Return> {
  type: TableType;
  data: T[];
  title?: string;
  serverPagination?: ServerPagination;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  topDetailsFilter?: string;
  // Expandable row support
  expandedRows?: Set<string>;
  onToggleExpand?: (id: string) => void;
  renderExpandedRow?: (item: T) => React.ReactNode;
  // Custom filter column key (for orders/returns that don't have "name")
  filterColumnKey?: string;
  filterPlaceholder?: string;
  // Custom filter function for multi-field filtering (e.g., orders/returns)
  customFilterFn?: (data: T[], filterValue: string) => T[];
}

export function Table<T extends Car | Part | Order | Return>({
  type,
  data,
  title,
  serverPagination,
  onPageChange,
  onPageSizeChange,
  topDetailsFilter,
  expandedRows,
  onToggleExpand,
  renderExpandedRow,
  filterColumnKey = "name",
  filterPlaceholder = "Filtruoti lentele",
  customFilterFn,
}: TableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

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

  const backendFilters = useAppSelector(selectBackendFilters);
  const orders = useAppSelector(selectOrders);

  // Helper to check if a row is expanded
  const isRowExpanded = useCallback(
    (id: string) => {
      return expandedRows?.has(id) ?? false;
    },
    [expandedRows]
  );

  const getColumns = useCallback((): ColumnDef<T>[] => {
    switch (type) {
      case LayoutType.PARTS:
        return PartTableColumns({
          onItemClick: handleItemClick as (part: Part) => void,
          backendFilters,
          topDetailsFilter,
          orders,
        }) as ColumnDef<T>[];
      case LayoutType.ORDERS:
        return OrderTableColumns({
          onToggleExpand: onToggleExpand || (() => {}),
          isExpanded: isRowExpanded,
        }) as ColumnDef<T>[];
      case LayoutType.RETURNS:
        return ReturnTableColumns({
          onToggleExpand: onToggleExpand || (() => {}),
          isExpanded: isRowExpanded,
        }) as ColumnDef<T>[];
      default:
        return [];
    }
  }, [
    type,
    handleItemClick,
    backendFilters,
    topDetailsFilter,
    orders,
    isRowExpanded,
    onToggleExpand,
  ]);

  const columns = useMemo(() => getColumns(), [getColumns]);

  // Apply custom filter if provided, otherwise use default data
  const filteredData = useMemo(() => {
    if (customFilterFn && globalFilter.trim()) {
      return customFilterFn(data, globalFilter);
    }
    return data;
  }, [data, globalFilter, customFilterFn]);

  const table = useReactTable({
    data: customFilterFn ? filteredData : data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: isServerSide ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: customFilterFn ? undefined : getFilteredRowModel(),
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
      <div className="rounded-lg border border-border bg-white overflow-hidden px-3">
        {/* Table Toolbar */}
        <div className="py-3">
          <TableToolbar
            showing={
              isServerSide && serverPagination
                ? Math.min(
                    (serverPagination.current_page - 1) *
                      serverPagination.per_page +
                      (customFilterFn ? filteredData.length : data.length),
                    serverPagination.total
                  )
                : table.getRowModel().rows.length
            }
            total={
              isServerSide && serverPagination
                ? serverPagination.total
                : customFilterFn
                ? filteredData.length
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
              customFilterFn
                ? globalFilter
                : (table
                    .getColumn(filterColumnKey)
                    ?.getFilterValue() as string) ?? ""
            }
            onFilterChange={(value: string) => {
              if (customFilterFn) {
                setGlobalFilter(value);
              } else {
                table.getColumn(filterColumnKey)?.setFilterValue(value);
              }
            }}
            filterPlaceholder={filterPlaceholder}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto my-3">
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
                table.getRowModel().rows.map((row, index) => {
                  const item = row.original;
                  // Extract item ID based on type - all current types have string or number id
                  let itemId: string;
                  if ("id" in item) {
                    itemId =
                      typeof item.id === "string" ? item.id : String(item.id);
                  } else {
                    // Fallback (shouldn't happen with current types)
                    itemId = row.id;
                  }
                  const isExpanded = expandedRows?.has(itemId) ?? false;
                  const isLastRow =
                    index === table.getRowModel().rows.length - 1;
                  // Show separator for orders and returns, but not after the last row
                  const showSeparator =
                    (type === LayoutType.ORDERS ||
                      type === LayoutType.RETURNS) &&
                    !isLastRow;

                  return (
                    <Fragment key={row.id}>
                      <TableRow
                        data-state={row.getIsSelected() && "selected"}
                        onClick={() => {
                          // Only handle click for parts (opens modal)
                          // Orders/returns use expandable rows instead
                          if (type === LayoutType.PARTS) {
                            handleItemClick(item);
                          }
                        }}
                        className={
                          type === LayoutType.PARTS
                            ? "cursor-pointer"
                            : "border-b-0"
                        }
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
                      {isExpanded && renderExpandedRow && (
                        <TableRow
                          key={`${row.id}-expanded`}
                          className="hover:bg-transparent border-b-0"
                        >
                          <TableCell
                            colSpan={columns.length}
                            className="p-0 px-4"
                          >
                            {renderExpandedRow(item)}
                          </TableCell>
                        </TableRow>
                      )}
                      {showSeparator && (
                        <TableRow
                          key={`${row.id}-separator`}
                          className="hover:bg-transparent border-b-0"
                        >
                          <TableCell
                            colSpan={columns.length}
                            className="p-0 py-2 border-b border-border"
                          />
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="p-0">
                    <EmptyState />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </BaseTable>
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

      {/* Only show detail modal for parts */}
      {type === LayoutType.PARTS && (
        <DetailModal
          type={type}
          item={selectedItem as Part | null}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
