import { useState, useEffect, useCallback, memo } from "react";
import { FilterState } from "@/types";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { StorageKeys } from "@/utils/storageKeys";
import { loadPersistedFilters } from "@/utils/storageHelpers";
import { LayoutType } from "@/components/filters/type";

interface AnalyticsFilterCardProps {
  backendFilters: any;
}

// Separate component that manages local filter state - this isolates re-renders
// Only this component re-renders when filters change, not AnalyticsView
export const AnalyticsFilterCard = memo(function AnalyticsFilterCard({
  backendFilters,
}: AnalyticsFilterCardProps) {
  const [filters, setFilters] = useState<FilterState>(
    loadPersistedFilters(StorageKeys.ANALYTICS_FILTERS)
  );

  // Persist filters to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(
        StorageKeys.ANALYTICS_FILTERS,
        JSON.stringify(filters)
      );
    } catch (error) {
      console.error("Error saving filters to sessionStorage:", error);
    }
  }, [filters]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  return (
    <FilterPanel
      type={LayoutType.ANALYTICS}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      hideCategoriesAndWheels={true}
      hideTopDetailsFilter={true}
    />
  );
});

