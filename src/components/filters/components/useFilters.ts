import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectCars, selectParts } from "@/store/selectors";
import { FilterState } from "@/types";
import { CarFilterState } from "@/utils/filterCars";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";

type FilterType = FilterState | CarFilterState | AnalyticsFilters;

export const useFilters = (filters: FilterType) => {
  const cars = useAppSelector(selectCars);
  const parts = useAppSelector(selectParts);

  // Shared computed values - computed once and reused
  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.brand))).sort();
  }, [cars]);

  const uniqueYears = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.year))).sort((a, b) => b - a);
  }, [cars]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(parts.map((p) => p.category))).sort();
  }, [parts]);

  // Unique models - depends on filter type and selected brands
  const uniqueModels = useMemo(() => {
    // Determine which brand filter property to use based on filter type
    let selectedBrands: string[] = [];

    if ("brand" in filters && Array.isArray(filters.brand)) {
      // Car filters or Analytics filters use "brand"
      selectedBrands = filters.brand;
    } else if ("carBrand" in filters && Array.isArray(filters.carBrand)) {
      // Parts filters use "carBrand"
      selectedBrands = filters.carBrand;
    }

    if (selectedBrands.length === 0) {
      return Array.from(new Set(cars.map((c) => c.model.name))).sort();
    }
    return Array.from(
      new Set(
        cars
          .filter((c) => selectedBrands.includes(c.brand))
          .map((c) => c.model.name)
      )
    ).sort();
  }, [cars, filters]);

  // Car-specific computed values
  const uniqueGearboxes = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.gearbox_type.name))).sort();
  }, [cars]);

  const uniqueBodyTypes = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.body_type.name))).sort();
  }, [cars]);

  const uniquePartTypes = useMemo(() => {
    return Array.from(new Set(parts.map((p) => p.partType))).sort();
  }, [parts]);

  return {
    uniqueBrands,
    uniqueModels,
    uniqueYears,
    uniqueGearboxes,
    uniqueCategories,
    uniqueBodyTypes,
    uniquePartTypes,
  };
};
