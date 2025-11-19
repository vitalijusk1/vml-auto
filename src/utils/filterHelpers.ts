import { FilterState } from "@/types";

/**
 * Creates a handler function for brand filter changes that clears carModel when brands change.
 * This is a common pattern used across multiple filter components.
 *
 * @param onFiltersChange - The callback function to update filters
 * @returns A handler function that takes selected brands and updates filters, clearing models
 *
 * @example
 * ```tsx
 * <BrandFilter
 *   selected={filters.carBrand || []}
 *   onChange={createBrandChangeHandler(onFiltersChange)}
 * />
 * ```
 */
export function createBrandChangeHandler(
  onFiltersChange: (updates: Partial<FilterState>) => void
) {
  return (selected: string[]) => {
    onFiltersChange({
      carBrand: selected,
      carModel: [],
    });
  };
}

/**
 * Creates a handler function for simple string array filter updates.
 * Used for filters like carModel, fuelType, bodyType, quality, position, etc.
 *
 * @param onFiltersChange - The callback function to update filters
 * @param field - The field name in FilterState to update
 * @returns A handler function that takes selected values and updates the specified field
 *
 * @example
 * ```tsx
 * <ModelFilter
 *   selected={filters.carModel || []}
 *   onChange={createStringArrayHandler(onFiltersChange, 'carModel')}
 * />
 * ```
 */
export function createStringArrayHandler(
  onFiltersChange: (updates: Partial<FilterState>) => void,
  field: keyof FilterState
) {
  return (selected: string[]) => {
    onFiltersChange({ [field]: selected } as Partial<FilterState>);
  };
}

/**
 * Creates a handler function for range filter updates (e.g., yearRange, priceRange, engineCapacityRange).
 * Merges the new range with the existing range to preserve other properties.
 *
 * @param onFiltersChange - The callback function to update filters
 * @param field - The field name in FilterState to update (must be a range type)
 * @param currentRange - The current range value from filters
 * @returns A handler function that takes a range object and updates the specified field
 *
 * @example
 * ```tsx
 * <YearRangeFilter
 *   min={filters.yearRange?.min}
 *   max={filters.yearRange?.max}
 *   onChange={createRangeHandler(onFiltersChange, 'yearRange', filters.yearRange)}
 * />
 * ```
 */
export function createRangeHandler(
  onFiltersChange: (updates: Partial<FilterState>) => void,
  field: "yearRange" | "priceRange" | "engineCapacityRange",
  currentRange?: { min?: number; max?: number }
) {
  return (range: { min?: number; max?: number }) => {
    onFiltersChange({
      [field]: {
        ...(currentRange || {}),
        ...range,
      },
    } as Partial<FilterState>);
  };
}
