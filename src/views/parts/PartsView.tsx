import { useState, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectParts, selectBackendFilters } from "@/store/selectors";
import { Table } from "../../components/tables/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { PartsFilterCard } from "./components/PartsFilterCard";
import { TopDetailsFilter } from "@/types";
import { useTablePagination } from "@/hooks/useTablePagination";
import { getPartsFilter } from "@/utils/tableFilters";
import { useExpandableParts } from "@/hooks/useExpandableParts";

export function PartsView() {
  const parts = useAppSelector(selectParts);
  const backendFilters = useAppSelector(selectBackendFilters);
  const {
    pagination,
    handlePaginationUpdate,
    handlePageChange,
    handlePageSizeChange,
  } = useTablePagination();
  const [topDetailsFilter, setTopDetailsFilter] = useState<TopDetailsFilter>(
    TopDetailsFilter.NONE
  );
  const [isLoading, setIsLoading] = useState(false);

  // Expandable parts functionality
  const { expandedRows, processedParts, toggleExpand } = useExpandableParts(
    parts,
    topDetailsFilter
  );

  // Handle top details filter change - wrapped in useCallback
  const handleTopDetailsFilterChange = useCallback(
    (value: TopDetailsFilter) => {
      setTopDetailsFilter(value);
    },
    []
  );

  // Unified parts filter function
  const partsFilterFn = useCallback(getPartsFilter(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sandėlys"
        description="Valdykite ir filtruokite sandėlio inventorių"
      />

      <PartsFilterCard
        onPaginationUpdate={handlePaginationUpdate}
        pagination={pagination}
        backendFilters={backendFilters}
        onTopDetailsFilterChange={handleTopDetailsFilterChange}
        onLoadingChange={setIsLoading}
      />

      <Table
        type="parts"
        data={processedParts}
        serverPagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        topDetailsFilter={topDetailsFilter}
        customFilterFn={partsFilterFn}
        filterPlaceholder="Filtruoti dalis..."
        expandedRows={expandedRows}
        onToggleExpand={toggleExpand}
        isLoading={isLoading}
        parentItemsCount={parts.length}
      />
    </div>
  );
}
