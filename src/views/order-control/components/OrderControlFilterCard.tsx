import { useState, useEffect, useCallback, memo } from "react";
import { FilterState } from "@/types";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { StorageKeys } from "@/utils/storageKeys";
import { defaultFilters } from "@/store/slices/filtersSlice";
import { LayoutType } from "@/components/filters/type";

const cloneDefaultFilters = (): FilterState =>
  JSON.parse(JSON.stringify(defaultFilters)) as FilterState;

interface PersistedOrderControlState {
  filters: {
    carBrand?: FilterState["carBrand"];
    carModel?: FilterState["carModel"];
    fuelType?: FilterState["fuelType"];
    engineCapacityRange?: FilterState["engineCapacityRange"];
    yearRange?: FilterState["yearRange"];
  };
}

interface OrderControlFilterCardProps {
  onFiltersChange: (filters: FilterState) => void;
  onFilter: () => void;
  isLoading: boolean;
  backendFilters: any;
}

// Separate component that manages local filter state and fetching - this isolates re-renders
// Only this component re-renders when filters change, not OrderControlView
export const OrderControlFilterCard = memo(function OrderControlFilterCard({
  onFiltersChange,
  onFilter,
  isLoading,
  backendFilters,
}: OrderControlFilterCardProps) {
  // Load persisted filters from sessionStorage on mount
  const loadPersistedFilters = (): FilterState => {
    try {
      const stored = sessionStorage.getItem(StorageKeys.ORDER_CONTROL_STATE);
      if (stored) {
        const persistedState: PersistedOrderControlState = JSON.parse(stored);
        if (persistedState.filters) {
          const defaultFilters = cloneDefaultFilters();
          return {
            ...defaultFilters,
            carBrand: persistedState.filters.carBrand || [],
            carModel: persistedState.filters.carModel || [],
            fuelType: persistedState.filters.fuelType || [],
            engineCapacityRange: persistedState.filters.engineCapacityRange,
            yearRange:
              persistedState.filters.yearRange ||
              defaultFilters.yearRange ||
              {},
          };
        }
      }
    } catch (error) {
      console.error("Error loading persisted filters:", error);
    }
    return cloneDefaultFilters();
  };

  const [filters, setFilters] = useState<FilterState>(loadPersistedFilters);

  // Persist filters to sessionStorage whenever they change
  useEffect(() => {
    try {
      const stateToSave: PersistedOrderControlState = {
        filters: {
          carBrand: filters.carBrand,
          carModel: filters.carModel,
          fuelType: filters.fuelType,
          engineCapacityRange: filters.engineCapacityRange,
          yearRange: filters.yearRange,
        },
      };
      sessionStorage.setItem(
        StorageKeys.ORDER_CONTROL_STATE,
        JSON.stringify(stateToSave)
      );
    } catch (error) {
      console.error("Error saving filters to sessionStorage:", error);
    }
  }, [filters]);

  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      setFilters(newFilters);
      onFiltersChange(newFilters);
    },
    [onFiltersChange]
  );

  const handleFilter = useCallback(() => {
    // Trigger fetch in parent component
    onFilter();
  }, [onFilter]);

  return (
    <FilterPanel
      type={LayoutType.ORDER_CONTROL}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      cars={[]}
      onFilter={handleFilter}
      isLoading={isLoading}
    />
  );
});
