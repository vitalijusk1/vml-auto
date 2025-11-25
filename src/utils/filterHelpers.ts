import { FilterState, FilterOption, RangeFilterField } from "@/types";

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
 *   onChange={brandChangeHandler(onFiltersChange)}
 * />
 * ```
 */
export function brandChangeHandler(
  onFiltersChange: (updates: Partial<FilterState>) => void
) {
  return (selected: FilterOption[]) => {
    onFiltersChange({
      carBrand: selected,
      carModel: [],
    });
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
 *   onChange={rangeHandler(onFiltersChange, 'yearRange', filters.yearRange)}
 * />
 * ```
 */
export function rangeHandler(
  onFiltersChange: (updates: Partial<FilterState>) => void,
  field: RangeFilterField,
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

/**
 * Find a category by ID in the categories tree
 */
export function findCategoryById<T extends { id: number; subcategories?: T[] }>(
  cats: T[],
  id: number
): T | undefined {
  for (const category of cats) {
    if (category.id === id) return category;
    if (category.subcategories) {
      const found = findCategoryById(category.subcategories, id);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Extract category IDs from FilterOption[], applying parent/child optimization.
 * When a parent is selected with all children, only the parent ID is sent to API.
 */
export function extractCategoryIds(
  categoryOptions: Array<{ name: string; id: number }>,
  backendFilters: any
): (string | number)[] {
  const categories = backendFilters?.categories;
  if (!Array.isArray(categories) || categoryOptions.length === 0) {
    return [];
  }

  // Build category map with pre-computed child IDs
  const categoryMap = new Map<number, { category: any; childIds: number[] }>();

  const getChildIds = (cat: any): number[] => {
    if (!cat.subcategories?.length) return [];
    const ids: number[] = [];
    for (const sub of cat.subcategories) {
      ids.push(sub.id, ...getChildIds(sub));
    }
    return ids;
  };

  const buildMap = (cats: any[]) => {
    for (const cat of cats) {
      categoryMap.set(cat.id, { category: cat, childIds: getChildIds(cat) });
      if (cat.subcategories?.length) buildMap(cat.subcategories);
    }
  };
  buildMap(categories);

  const selectedIds = new Set(categoryOptions.map((c) => c.id));
  const resultIds: (string | number)[] = [];
  const handled = new Set<number>();

  for (const { id } of categoryOptions) {
    if (handled.has(id)) continue;

    const entry = categoryMap.get(id);
    if (!entry) {
      // Category not in backend - use raw ID
      resultIds.push(id);
      handled.add(id);
      continue;
    }

    const { category, childIds } = entry;
    const hasAllChildren =
      childIds.length > 0 && childIds.every((cid) => selectedIds.has(cid));

    if (hasAllChildren) {
      // Parent with all children selected - add parent only, skip children
      resultIds.push(category.rrr_id ?? category.id);
      handled.add(id);
      childIds.forEach((cid) => handled.add(cid));
    } else {
      // Add this category
      resultIds.push(category.rrr_id ?? category.id);
      handled.add(id);
    }
  }

  return resultIds;
}
