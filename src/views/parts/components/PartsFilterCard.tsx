import { useState, useEffect, useCallback, memo, useRef } from "react";
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
  onLoadingChange?: (isLoading: boolean) => void;
  searchQuery?: string;
}

// Separate component that manages local filter state and fetching - this isolates re-renders
// Only this component re-renders when filters change, not PartsView
export const PartsFilterCard = memo(function PartsFilterCard({
  onPaginationUpdate,
  pagination,
  backendFilters,
  onTopDetailsFilterChange,
  onLoadingChange,
  searchQuery,
}: PartsFilterCardProps) {
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<FilterState>(
    loadPersistedFilters(StorageKeys.PARTS_FILTERS)
  );
  const [topDetailsFilter, setTopDetailsFilter] = useState<TopDetailsFilter>(
    () => {
      const persistedFilters = loadPersistedFilters(StorageKeys.PARTS_FILTERS);
      return persistedFilters.sortBy || TopDetailsFilter.NONE;
    }
  );
  const [isLoading, setIsLoading] = useState(false);
  const hasFetchedInitially = useRef(false);
  const lastFetchParams = useRef<string | null>(null);

  // Notify parent when loading state changes
  useEffect(() => {
    onLoadingChange?.(isLoading);
  }, [isLoading, onLoadingChange]);

  // Persist filters to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(
        StorageKeys.PARTS_FILTERS,
        JSON.stringify({ ...filters, sortBy: topDetailsFilter })
      );
    } catch (error) {
      console.error("Error saving filters to sessionStorage:", error);
    }
  }, [filters, topDetailsFilter]);

  // Core fetch function - reused by both fetchParts and handleFilter
  const executeFetch = useCallback(
    async (page: number) => {
      if (!backendFilters) return;

      setIsLoading(true);
      try {
        const queryParams = filterStateToQueryParams(
          filters,
          { page, per_page: pagination.per_page },
          backendFilters,
          topDetailsFilter
        );

        // Only add search query if it's not empty
        if (searchQuery?.trim()) {
          queryParams.search = searchQuery.trim();
        } else {
          delete queryParams.search;
        }

        const response = await getParts(queryParams, backendFilters);
        dispatch(setParts(response.parts));
        onPaginationUpdate(response.pagination);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      filters,
      pagination.per_page,
      backendFilters,
      topDetailsFilter,
      searchQuery,
      dispatch,
      onPaginationUpdate,
    ]
  );

  // Fetch parts based on current pagination
  const fetchParts = useCallback(() => {
    executeFetch(pagination.current_page);
  }, [executeFetch, pagination.current_page]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleTopDetailsFilterChange = useCallback(
    (value: TopDetailsFilter) => {
      setTopDetailsFilter(value);
    },
    []
  );

  const handleFilter = useCallback(async () => {
    // Reset to page 1 when filtering
    onPaginationUpdate({ ...pagination, current_page: 1 });
    // Notify parent of the applied filter
    onTopDetailsFilterChange(topDetailsFilter);
    // Fetch with page 1
    await executeFetch(1);
  }, [
    pagination,
    onPaginationUpdate,
    topDetailsFilter,
    onTopDetailsFilterChange,
    executeFetch,
  ]);

  // Single effect to handle all fetch triggers - prevents duplicate fetches
  useEffect(() => {
    if (!backendFilters) {
      return;
    }

    // Create a key representing current fetch parameters
    const fetchKey = JSON.stringify({
      page: pagination.current_page,
      per_page: pagination.per_page,
      search: searchQuery,
    });

    // Skip if we've already fetched with these exact params
    if (hasFetchedInitially.current && lastFetchParams.current === fetchKey) {
      return;
    }

    lastFetchParams.current = fetchKey;
    hasFetchedInitially.current = true;
    fetchParts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    backendFilters,
    pagination.current_page,
    pagination.per_page,
    searchQuery,
  ]);

  return (
    <FilterPanel
      type={LayoutType.PARTS}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onTopDetailsFilterChange={handleTopDetailsFilterChange}
      onFilter={handleFilter}
      isLoading={isLoading}
    />
  );
});
