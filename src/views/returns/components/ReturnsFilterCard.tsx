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
  onReturnsUpdate: () => void;
  backendFilters: any;
}

// Separate component that manages local filter state and fetching - this isolates re-renders
// Only this component re-renders when filters change, not ReturnsView
export const ReturnsFilterCard = memo(function ReturnsFilterCard({
  onReturnsUpdate,
  backendFilters,
}: ReturnsFilterCardProps) {
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<FilterState>(
    loadPersistedFilters(StorageKeys.RETURNS_FILTERS)
  );
  const [isLoading, setIsLoading] = useState(false);

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
        {},
        backendFilters
      );

      const response = await getReturns(queryParams);
      const returnsArray = Array.isArray(response) ? response : [];

      dispatch(setReturns(returnsArray));
      onReturnsUpdate();
    } catch (error) {
      console.error("Error fetching returns:", error);
      dispatch(setReturns([]));
      onReturnsUpdate();
    } finally {
      setIsLoading(false);
    }
  }, [filters, backendFilters, dispatch, onReturnsUpdate]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleFilter = useCallback(() => {
    // Fetch immediately when filter button is clicked
    fetchReturns();
  }, [fetchReturns]);

  // Fetch on initial load when backendFilters become available
  useEffect(() => {
    if (backendFilters) {
      fetchReturns();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendFilters]);

  return (
    <FilterPanel
      type={LayoutType.PARTS}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      cars={[]}
      onFilter={handleFilter}
      isLoading={isLoading}
      hideCategoriesAndWheels={true}
      hideTopDetailsFilter={true}
    />
  );
});
