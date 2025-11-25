import { PaginationState } from "@tanstack/react-table";
import { PageSizeSelector } from "./PageSizeSelector";
import { TableFilter } from "./TableFilter";
import { Button } from "./button";
import { Download } from "lucide-react";

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

  // Download
  onDownloadPDF?: () => void;
  onDownloadCSV?: () => void;

  // Optional custom content
  children?: React.ReactNode;
}

export function TableToolbar({
  showing,
  total,
  itemName = "detalių",
  pagination,
  onPageSizeChange,
  pageSizeOptions,
  filterValue,
  onFilterChange,
  filterPlaceholder,
  onDownloadPDF,
  onDownloadCSV,
  children,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col gap-3">
      {/* Item count and controls - responsive layout */}
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
        {/* Item count - left side on desktop, top on mobile */}
        <div className="text-sm text-muted-foreground">
          Rodoma {showing} iš {total} {itemName}
        </div>

        {/* Controls - right side on desktop, bottom on mobile */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 xl:items-center w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-shrink-0">
            <PageSizeSelector
              pagination={pagination}
              onPageSizeChange={onPageSizeChange}
              options={pageSizeOptions}
            />
          </div>
          <div className="w-full sm:w-[300px]">
            <TableFilter
              value={filterValue}
              onChange={onFilterChange}
              placeholder={filterPlaceholder}
              className="w-full"
            />
          </div>
          {(onDownloadPDF || onDownloadCSV) && (
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              {onDownloadPDF && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownloadPDF}
                  className="h-10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Atsisiųsti .pdf
                </Button>
              )}
              {onDownloadCSV && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDownloadCSV}
                  className="h-10"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Atsisiųsti .csv
                </Button>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
