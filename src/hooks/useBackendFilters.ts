import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";
import { Category } from "@/utils/backendFilters";

// Helper function to extract names from FilterOption arrays or string arrays
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
  wheels?: string[];
  wheel_drives?: string[];
  wheels_fixing_points?: string[];
  wheels_spacing?: string[];
  wheels_central_diameter?: string[];
  wheels_width?: string[];
  wheels_height?: string[];
  wheels_tread_depth?: string[];
}

export interface UseBackendFiltersReturn {
  // Car filters
  brands: string[];
  models: string[];
  bodyTypes: string[];
  fuelTypes: string[];

  // Parts filters
  statuses: string[];
  qualities: string[];
  positions: string[];

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
    return Array.isArray(brandsData) ? extractNames(brandsData) : [];
  }, [backendFilters]);

  const models = useMemo(() => {
    const carFilters = backendFilters?.car;
    const modelsData = carFilters?.models || carFilters?.car_models;
    return Array.isArray(modelsData) ? extractNames(modelsData) : [];
  }, [backendFilters]);

  const bodyTypes = useMemo(() => {
    const bodyTypesData = backendFilters?.car?.body_types;
    return Array.isArray(bodyTypesData) ? extractNames(bodyTypesData) : [];
  }, [backendFilters]);

  const fuelTypes = useMemo(() => {
    const fuelTypesData =
      backendFilters?.car?.fuel_types || backendFilters?.car?.fuels;
    return Array.isArray(fuelTypesData) ? extractNames(fuelTypesData) : [];
  }, [backendFilters]);

  // Extract parts filters
  const statuses = useMemo(() => {
    if (Array.isArray(backendFilters?.parts?.statuses)) {
      return extractNames(backendFilters.parts.statuses);
    }
    // Fallback to default statuses if not available from backend
    return ["In Stock", "Reserved", "Sold", "Returned"];
  }, [backendFilters]);

  const qualities = useMemo(() => {
    const qualitiesData = backendFilters?.parts?.qualities;
    return Array.isArray(qualitiesData) ? extractNames(qualitiesData) : [];
  }, [backendFilters]);

  const positions = useMemo(() => {
    const positionsData = backendFilters?.parts?.positions;
    return Array.isArray(positionsData) ? extractNames(positionsData) : [];
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

    // Map backend keys to WheelsSection expected keys and extract names
    return {
      wheels: wheels.wheels ? extractNames(wheels.wheels) : undefined,
      wheel_drives:
        wheels.drives || wheels.wheel_drives
          ? extractNames(
              Array.isArray(wheels.drives)
                ? wheels.drives
                : Array.isArray(wheels.wheel_drives)
                ? wheels.wheel_drives
                : []
            )
          : undefined,
      wheels_fixing_points:
        wheels.fixing_points || wheels.wheels_fixing_points
          ? extractNames(
              Array.isArray(wheels.fixing_points)
                ? wheels.fixing_points
                : Array.isArray(wheels.wheels_fixing_points)
                ? wheels.wheels_fixing_points
                : []
            )
          : undefined,
      wheels_spacing:
        wheels.spacing || wheels.wheels_spacing
          ? extractNames(
              Array.isArray(wheels.spacing)
                ? wheels.spacing
                : Array.isArray(wheels.wheels_spacing)
                ? wheels.wheels_spacing
                : []
            )
          : undefined,
      wheels_central_diameter:
        wheels.central_diameter || wheels.wheels_central_diameter
          ? extractNames(
              Array.isArray(wheels.central_diameter)
                ? wheels.central_diameter
                : Array.isArray(wheels.wheels_central_diameter)
                ? wheels.wheels_central_diameter
                : []
            )
          : undefined,
      wheels_width:
        wheels.width || wheels.wheels_width
          ? extractNames(
              Array.isArray(wheels.width)
                ? wheels.width
                : Array.isArray(wheels.wheels_width)
                ? wheels.wheels_width
                : []
            )
          : undefined,
      wheels_height:
        wheels.height || wheels.wheels_height
          ? extractNames(
              Array.isArray(wheels.height)
                ? wheels.height
                : Array.isArray(wheels.wheels_height)
                ? wheels.wheels_height
                : []
            )
          : undefined,
      wheels_tread_depth:
        wheels.tread_depth || wheels.wheels_tread_depth
          ? extractNames(
              Array.isArray(wheels.tread_depth)
                ? wheels.tread_depth
                : Array.isArray(wheels.wheels_tread_depth)
                ? wheels.wheels_tread_depth
                : []
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
