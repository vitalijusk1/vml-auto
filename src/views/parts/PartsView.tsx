import { useState, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectParts, selectBackendFilters } from "@/store/selectors";
import { Table } from "../../components/tables/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { PartsFilterCard } from "./components/PartsFilterCard";
import { TopDetailsFilter } from "@/types";
import { useTablePagination } from "@/hooks/useTablePagination";
import { useExpandableParts } from "@/hooks/useExpandableParts";
import { useDebounce } from "@/hooks/useDebounce";
import { loadPersistedFilters } from "@/utils/storageHelpers";
import { StorageKeys } from "@/utils/storageKeys";

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
    () => {
      const persistedFilters = loadPersistedFilters(StorageKeys.PARTS_FILTERS);
      return persistedFilters.sortBy || TopDetailsFilter.NONE;
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 800);

  // Expandable parts functionality
  const { expandedRows, processedParts, toggleExpand } = useExpandableParts(
    parts,
    topDetailsFilter,
    backendFilters
  );

  // Handle top details filter change - wrapped in useCallback
  const handleTopDetailsFilterChange = useCallback(
    (value: TopDetailsFilter) => {
      setTopDetailsFilter(value);
    },
    []
  );

  // Handle search change from table
  const handleSearchChange = useCallback((search: string) => {
    setSearchQuery(search);
  }, []);

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
        searchQuery={debouncedSearchQuery}
      />

      <Table
        type="parts"
        data={processedParts}
        serverPagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSearchChange={handleSearchChange}
        topDetailsFilter={topDetailsFilter}
        filterPlaceholder="Filtruoti dalis..."
        expandedRows={expandedRows}
        onToggleExpand={toggleExpand}
        isLoading={isLoading}
        parentItemsCount={parts.length}
      />
    </div>
  );
}
