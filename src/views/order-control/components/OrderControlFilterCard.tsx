import { useState, useEffect, useCallback, memo, useRef } from "react";
import { Car, FilterState } from "@/types";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { StorageKeys } from "@/utils/storageKeys";
import { loadPersistedFilters } from "@/utils/storageHelpers";
import { LayoutType } from "@/components/filters/type";
import { getCars } from "@/api/cars";

interface OrderControlFilterCardProps {
  onCarsUpdate: (cars: Car[]) => void;
  backendFilters: any;
}

// Separate component that manages local filter state and fetching - this isolates re-renders
// Only this component re-renders when filters change, not OrderControlView
export const OrderControlFilterCard = memo(function OrderControlFilterCard({
  onCarsUpdate,
  backendFilters,
}: OrderControlFilterCardProps) {
  const [filters, setFilters] = useState<FilterState>(
    loadPersistedFilters(StorageKeys.ORDER_CONTROL_STATE)
  );
  const [isLoading, setIsLoading] = useState(false);
  const fetchCarsInProgressRef = useRef(false);

  // Persist filters to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(
        StorageKeys.ORDER_CONTROL_STATE,
        JSON.stringify(filters)
      );
    } catch (error) {
      console.error("Error saving filters to sessionStorage:", error);
    }
  }, [filters]);

  // Fetch cars based on current filters
  const fetchCars = useCallback(async () => {
    // Prevent concurrent fetches
    if (fetchCarsInProgressRef.current) {
      return;
    }

    // Validate required filters
    if (
      !filters.carBrand ||
      filters.carBrand.length === 0 ||
      !filters.carModel ||
      filters.carModel.length === 0 ||
      !backendFilters
    ) {
      onCarsUpdate([]);
      return;
    }

    fetchCarsInProgressRef.current = true;
    setIsLoading(true);

    try {
      // Extract IDs directly from FilterOption objects
      const brandIds = filters.carBrand.map((brand) => brand.id);

      const modelIds = filters.carModel.map((model) => model.id);

      const fuelIds = filters.fuelType.map((fuel) => fuel.id);

      // Build query params
      const queryParams: any = {
        page: 1,
        per_page: 1000, // Get all cars for selection
      };

      if (brandIds.length > 0) {
        queryParams.brand_id = brandIds.length === 1 ? brandIds[0] : brandIds;
      }

      if (modelIds.length > 0) {
        queryParams.car_model_id =
          modelIds.length === 1 ? modelIds[0] : modelIds;
      }

      if (fuelIds.length > 0) {
        queryParams.car_fuel_id = fuelIds.length === 1 ? fuelIds[0] : fuelIds;
      }

      const response = await getCars(queryParams);
      onCarsUpdate(response.cars);
    } catch (error) {
      console.error("Error fetching cars:", error);
      onCarsUpdate([]);
    } finally {
      setIsLoading(false);
      fetchCarsInProgressRef.current = false;
    }
  }, [filters, backendFilters, onCarsUpdate]);

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleFilter = useCallback(() => {
    // Fetch immediately when filter button is clicked
    fetchCars();
  }, [fetchCars]);

  return (
    <FilterPanel
      type={LayoutType.ORDER_CONTROL}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onFilter={handleFilter}
      isLoading={isLoading}
    />
  );
});
