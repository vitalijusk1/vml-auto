import { useState, useEffect, useCallback, memo } from "react";
import { useAppDispatch } from "@/store/hooks";
import { getReturns, filterStateToReturnsQueryParams } from "@/api/returns";
import { FilterState } from "@/types";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { StorageKeys } from "@/utils/storageKeys";
import { loadPersistedFilters } from "@/utils/storageHelpers";
import { setReturns } from "@/store/slices/dataSlice";
import { LayoutType } from "@/components/filters/type";

interface ReturnsFilterCardProps {
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
  searchQuery?: string;
  onLoadingChange?: (isLoading: boolean) => void;
}

// Separate component that manages local filter state and fetching - this isolates re-renders
// Only this component re-renders when filters change, not ReturnsView
export const ReturnsFilterCard = memo(function ReturnsFilterCard({
  onPaginationUpdate,
  pagination,
  backendFilters,
  searchQuery,
  onLoadingChange,
}: ReturnsFilterCardProps) {
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<FilterState>(
    loadPersistedFilters(StorageKeys.RETURNS_FILTERS)
  );
  const [isLoading, setIsLoading] = useState(false);

  // Notify parent when loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  // Persist filters to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(
        StorageKeys.RETURNS_FILTERS,
        JSON.stringify(filters)
      );
    } catch (error) {
      console.error("Error saving filters to sessionStorage:", error);
    }
  }, [filters]);

  // Fetch returns based on current filters
  const fetchReturns = useCallback(async () => {
    if (!backendFilters) {
      return;
    }

    setIsLoading(true);

    try {
      const queryParams = filterStateToReturnsQueryParams(
        filters,
        {
          page: pagination.current_page,
          per_page: pagination.per_page,
        },
        backendFilters
      );

      // Only add search query if it's not empty
      if (searchQuery && searchQuery.trim()) {
        queryParams.search = searchQuery.trim();
      } else {
        // Explicitly remove search parameter if query is empty
        delete queryParams.search;
      }

      const response = await getReturns(queryParams);
      dispatch(setReturns(response.returns));

      // Update pagination if available
      if (response.pagination) {
        onPaginationUpdate(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching returns:", error);
      dispatch(setReturns([]));
    } finally {
      setIsLoading(false);
    }
  }, [
    filters,
    pagination,
    backendFilters,
    searchQuery,
    dispatch,
    onPaginationUpdate,
  ]);

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
    fetchReturns();
  }, [pagination, onPaginationUpdate, fetchReturns]);

  // Fetch on initial load when backendFilters become available
  useEffect(() => {
    if (backendFilters) {
      fetchReturns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendFilters]);

  // Fetch when pagination or search changes
  useEffect(() => {
    if (backendFilters) {
      fetchReturns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current_page, pagination.per_page, searchQuery]);

  return (
    <FilterPanel
      type={LayoutType.RETURNS}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onFilter={handleFilter}
      isLoading={isLoading}
      hideCategoriesAndWheels={true}
      hideTopDetailsFilter={true}
    />
  );
});
