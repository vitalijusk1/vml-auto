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
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectParts, selectSelectedParts } from "@/store/selectors";
import {
  togglePartSelection,
  selectAllParts,
  clearSelection,
} from "@/store/slices/uiSlice";
import { Part, PartStatus } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TableToolbar } from "@/components/ui/TableToolbar";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { PartDetailModal } from "./PartDetailModal";

import { getStatusBadgeClass } from "@/theme/utils";

const getPartStatusClass = (status: PartStatus) => {
  const statusMap: Record<PartStatus, string> = {
    "In Stock": getStatusBadgeClass("part", "In Stock"),
    Reserved: getStatusBadgeClass("part", "Reserved"),
    Sold: getStatusBadgeClass("part", "Sold"),
    Returned: getStatusBadgeClass("part", "Returned"),
  };
  return statusMap[status] || getStatusBadgeClass("part", "Returned");
};

interface PartsInventoryTableProps {
  parts?: Part[];
}

export function PartsInventoryTable({
  parts: providedParts,
}: PartsInventoryTableProps = {}) {
  const dispatch = useAppDispatch();
  const allParts = useAppSelector(selectParts);
  const filteredParts = providedParts || allParts;
  const selectedParts = useAppSelector(selectSelectedParts);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        dispatch(selectAllParts(filteredParts.map((p) => p.id)));
      } else {
        dispatch(clearSelection());
      }
    },
    [dispatch, filteredParts]
  );

  const handlePartClick = useCallback((part: Part) => {
    setSelectedPart(part);
    setIsModalOpen(true);
  }, []);

  const columns: ColumnDef<Part>[] = useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedParts.includes(row.original.id)}
            onChange={() => dispatch(togglePartSelection(row.original.id))}
            className="rounded border-gray-300"
          />
        ),
      },
      {
        accessorKey: "photos",
        header: "Photo",
        cell: ({ row }) => (
          <img
            src={row.original.photos[0]}
            alt={row.original.name}
            className="w-12 h-12 object-cover rounded"
          />
        ),
      },
      {
        accessorKey: "code",
        header: "Part ID / Code",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.code}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.id}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: "Part Name / Category",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-xs text-muted-foreground">
              {row.original.category}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "carBrand",
        header: "Car Brand & Model",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">
              {row.original.carBrand} {row.original.carModel}
            </div>
            <div className="text-xs text-muted-foreground">
              Year: {row.original.carYear}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "partType",
        header: "Part Type",
      },
      {
        accessorKey: "manufacturerCode",
        header: "Manufacturer Code",
        cell: ({ row }) => row.original.manufacturerCode || "N/A",
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getPartStatusClass(
              row.original.status
            )}`}
          >
            {row.original.status}
          </span>
        ),
      },
      {
        accessorKey: "quantity",
        header: "Quantity",
      },
      {
        accessorKey: "priceEUR",
        header: "Price (EUR/PLN)",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">€{row.original.priceEUR}</div>
            <div className="text-xs text-muted-foreground">
              PLN {row.original.pricePLN}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "daysInInventory",
        header: "Days in Inventory",
        cell: ({ row }) => {
          const days = row.original.daysInInventory;
          let color = "text-inventory-normal";
          if (days > 180) color = "text-inventory-critical";
          else if (days > 90) color = "text-inventory-warning";
          return <span className={color}>{days}</span>;
        },
      },
      {
        accessorKey: "dateAdded",
        header: "Date Added",
        cell: ({ row }) => format(row.original.dateAdded, "MMM dd, yyyy"),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePartClick(row.original)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [selectedParts, dispatch, handleSelectAll, handlePartClick]
  );

  const table = useReactTable({
    data: filteredParts,
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

  return (
    <div className="space-y-4">
      <TableToolbar
        showing={table.getRowModel().rows.length}
        total={filteredParts.length}
        itemName="parts"
        pagination={pagination}
        onPageSizeChange={(pageSize: number) => {
          setPagination({
            ...pagination,
            pageSize,
            pageIndex: 0,
          });
        }}
        filterValue={
          (table.getColumn("name")?.getFilterValue() as string) ?? ""
        }
        onFilterChange={(value: string) =>
          table.getColumn("name")?.setFilterValue(value)
        }
        filterPlaceholder="Filter table..."
      />

      <div className="rounded-md border">
        <Table>
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
        </Table>
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

      <PartDetailModal
        part={selectedPart}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPart(null);
        }}
      />
    </div>
  );
}
