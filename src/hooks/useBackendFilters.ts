import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";
import { Category } from "@/utils/backendFilters";
import { FilterOption } from "@/types";

// Helper function to extract FilterOption objects from backend filter data
const extractFilterOptions = (items: any[]): FilterOption[] => {
  return items
    .map((item) => {
      if (typeof item === "string") {
        // If it's a string, we can't create a FilterOption without an ID
        // This shouldn't happen with the new backend, but handle gracefully
        return null;
      }
      if (item && typeof item === "object" && item.id !== undefined) {
        // Extract name - prioritize Lithuanian, fallback to English, then name property
        let name = "";
        if (item.languages?.lt) {
          name = item.languages.lt;
        } else if (item.languages?.en) {
          name = item.languages.en;
        } else if (item.languages?.name) {
          name = item.languages.name;
        } else if (item.name) {
          name = item.name;
        } else {
          // Fallback to string representation if no name found
          name = String(item.id);
        }
        return { name, id: item.id };
      }
      return null;
    })
    .filter((item): item is FilterOption => item !== null);
};

// Helper function to extract names from FilterOption arrays or string arrays (for statuses and wheels)
const extractNames = (items: any[]): string[] => {
  return items.map((item) => {
    if (typeof item === "string") return item;
    if (item && typeof item === "object") {
      // Check if it's a FilterOption with languages - prioritize Lithuanian, fallback to English
      if (item.languages?.lt) return item.languages.lt;
      if (item.languages?.en) return item.languages.en;
      if (item.languages?.name) return item.languages.name;
      if (item.name) return item.name;
    }
    return String(item);
  });
};

interface WheelsFilters {
  wheels?: FilterOption[];
  wheel_drives?: FilterOption[];
  wheels_fixing_points?: FilterOption[];
  wheels_spacing?: FilterOption[];
  wheels_central_diameter?: FilterOption[];
  wheels_width?: FilterOption[];
  wheels_height?: FilterOption[];
  wheels_tread_depth?: FilterOption[];
}

export interface UseBackendFiltersReturn {
  // Car filters
  brands: FilterOption[];
  models: FilterOption[];
  bodyTypes: FilterOption[];
  fuelTypes: FilterOption[];

  // Parts filters
  statuses: FilterOption[];
  qualities: FilterOption[];
  positions: FilterOption[];

  // Shared filters
  categories: Category[];
  wheelsFilters: WheelsFilters | undefined;
}

/**
 * Hook to extract all filter options from backend filters.
 * Handles both string arrays and FilterOption objects, extracting unique string values.
 */
export const useBackendFilters = (): UseBackendFiltersReturn => {
  const backendFilters = useAppSelector(selectBackendFilters);

  // Extract car filters
  const brands = useMemo(() => {
    const brandsData = backendFilters?.car?.brands;
    return Array.isArray(brandsData) ? extractFilterOptions(brandsData) : [];
  }, [backendFilters]);

  const models = useMemo(() => {
    const carFilters = backendFilters?.car;
    const modelsData = carFilters?.models || carFilters?.car_models;
    return Array.isArray(modelsData) ? extractFilterOptions(modelsData) : [];
  }, [backendFilters]);

  const bodyTypes = useMemo(() => {
    const bodyTypesData = backendFilters?.car?.body_types;
    return Array.isArray(bodyTypesData) ? extractFilterOptions(bodyTypesData) : [];
  }, [backendFilters]);

  const fuelTypes = useMemo(() => {
    const fuelTypesData =
      backendFilters?.car?.fuel_types || backendFilters?.car?.fuels;
    return Array.isArray(fuelTypesData) ? extractFilterOptions(fuelTypesData) : [];
  }, [backendFilters]);

  // Extract parts filters
  const statuses = useMemo(() => {
    const statusesData = backendFilters?.parts?.statuses;
    if (Array.isArray(statusesData)) {
      return extractFilterOptions(statusesData);
    }
    // Fallback to empty array if not available from backend
    return [];
  }, [backendFilters]);

  const qualities = useMemo(() => {
    const qualitiesData = backendFilters?.parts?.qualities;
    return Array.isArray(qualitiesData) ? extractFilterOptions(qualitiesData) : [];
  }, [backendFilters]);

  const positions = useMemo(() => {
    const positionsData = backendFilters?.parts?.positions;
    return Array.isArray(positionsData) ? extractFilterOptions(positionsData) : [];
  }, [backendFilters]);

  // Extract categories
  const categories = useMemo(() => {
    return Array.isArray(backendFilters?.categories)
      ? backendFilters.categories
      : [];
  }, [backendFilters]);

  // Extract wheels filters and map to expected structure
  const wheelsFilters = useMemo(() => {
    const wheels = backendFilters?.wheels;
    if (!wheels) return undefined;

    // Helper to get array from either property
    const getWheelsArray = (prop1: any, prop2: any): any[] | undefined => {
      if (Array.isArray(prop1)) return prop1;
      if (Array.isArray(prop2)) return prop2;
      return undefined;
    };

    // Map backend keys to WheelsSection expected keys and extract FilterOption[]
    return {
      wheels: wheels.wheels ? extractFilterOptions(wheels.wheels) : undefined,
      wheel_drives: getWheelsArray(wheels.drives, wheels.wheel_drives)
        ? extractFilterOptions(
            getWheelsArray(wheels.drives, wheels.wheel_drives)!
          )
        : undefined,
      wheels_fixing_points: getWheelsArray(
        wheels.fixing_points,
        wheels.wheels_fixing_points
      )
        ? extractFilterOptions(
            getWheelsArray(wheels.fixing_points, wheels.wheels_fixing_points)!
          )
        : undefined,
      wheels_spacing: getWheelsArray(wheels.spacing, wheels.wheels_spacing)
        ? extractFilterOptions(
            getWheelsArray(wheels.spacing, wheels.wheels_spacing)!
          )
        : undefined,
      wheels_central_diameter: getWheelsArray(
        wheels.central_diameter,
        wheels.wheels_central_diameter
      )
        ? extractFilterOptions(
            getWheelsArray(
              wheels.central_diameter,
              wheels.wheels_central_diameter
            )!
          )
        : undefined,
      wheels_width: getWheelsArray(wheels.width, wheels.wheels_width)
        ? extractFilterOptions(getWheelsArray(wheels.width, wheels.wheels_width)!)
        : undefined,
      wheels_height: getWheelsArray(wheels.height, wheels.wheels_height)
        ? extractFilterOptions(
            getWheelsArray(wheels.height, wheels.wheels_height)!
          )
        : undefined,
      wheels_tread_depth: getWheelsArray(
        wheels.tread_depth,
        wheels.wheels_tread_depth
      )
        ? extractFilterOptions(
            getWheelsArray(wheels.tread_depth, wheels.wheels_tread_depth)!
          )
        : undefined,
    };
  }, [backendFilters]);

  return {
    brands,
    models,
    bodyTypes,
    fuelTypes,
    statuses,
    qualities,
    positions,
    categories,
    wheelsFilters,
  };
};
