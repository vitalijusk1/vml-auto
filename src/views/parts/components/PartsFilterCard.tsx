import { useState, useEffect, useCallback, memo } from "react";
import { useAppDispatch } from "@/store/hooks";
import { getParts, filterStateToQueryParams } from "@/api/parts";
import { FilterState, TopDetailsFilter } from "@/types";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { StorageKeys } from "@/utils/storageKeys";
import { loadPersistedFilters } from "@/utils/storageHelpers";
import { setParts } from "@/store/slices/dataSlice";
import { LayoutType } from "@/components/filters/type";

interface PartsFilterCardProps {
  onPaginationUpdate: (pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  }) => void;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  backendFilters: any;
  onTopDetailsFilterChange: (value: TopDetailsFilter) => void;
}

// Separate component that manages local filter state and fetching - this isolates re-renders
// Only this component re-renders when filters change, not PartsView
export const PartsFilterCard = memo(function PartsFilterCard({
  onPaginationUpdate,
  pagination,
  backendFilters,
  onTopDetailsFilterChange,
}: PartsFilterCardProps) {
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<FilterState>(
    loadPersistedFilters(StorageKeys.PARTS_FILTERS)
  );
  const [isLoading, setIsLoading] = useState(false);

  // Persist filters to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(
        StorageKeys.PARTS_FILTERS,
        JSON.stringify(filters)
      );
    } catch (error) {
      console.error("Error saving filters to sessionStorage:", error);
    }
  }, [filters]);

  // Fetch parts based on current filters
  const fetchParts = useCallback(async () => {
    if (!backendFilters) {
      return;
    }

    setIsLoading(true);
    try {
      const queryParams = filterStateToQueryParams(
        filters,
        {
          page: pagination.current_page,
          per_page: pagination.per_page,
        },
        backendFilters
      );

      const response = await getParts(queryParams);
      dispatch(setParts(response.parts));
      onPaginationUpdate(response.pagination);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination, backendFilters, dispatch, onPaginationUpdate]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleFilter = useCallback(() => {
    // Reset to page 1 when filtering
    onPaginationUpdate({
      ...pagination,
      current_page: 1,
    });
    // Fetch immediately when filter button is clicked
    fetchParts();
  }, [pagination, onPaginationUpdate, fetchParts]);

  // Fetch on initial load when backendFilters become available
  useEffect(() => {
    if (backendFilters) {
      fetchParts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendFilters]);

  // Fetch when pagination changes (from table pagination controls)
  useEffect(() => {
    fetchParts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current_page, pagination.per_page]);

  return (
    <FilterPanel
      type={LayoutType.PARTS}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onTopDetailsFilterChange={onTopDetailsFilterChange}
      onFilter={handleFilter}
      isLoading={isLoading}
    />
  );
});
