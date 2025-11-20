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
 * Get all child category IDs recursively for a given category
 */
function getAllChildCategoryIds(category: any): number[] {
  const ids: number[] = [];
  if (category.subcategories && Array.isArray(category.subcategories)) {
    for (const subcat of category.subcategories) {
      if (typeof subcat.id === "number") {
        ids.push(subcat.id);
      }
      // Recursively get grandchildren
      ids.push(...getAllChildCategoryIds(subcat));
    }
  }
  return ids;
}

/**
 * Find a category by ID in the categories tree
 */
function findCategoryById(cats: any[], id: number): any | undefined {
  for (const category of cats) {
    if (category.id === id) {
      return category;
    }
    // Recursively search subcategories
    if (category.subcategories && Array.isArray(category.subcategories)) {
      const found = findCategoryById(category.subcategories, id);
      if (found !== undefined) {
        return found;
      }
    }
  }
  return undefined;
}

/**
 * Extract category IDs from FilterOption[], applying parent/child optimization logic.
 * Only returns parent IDs when parent is selected with all children.
 * This ensures that when a parent category is selected, we only send the parent ID to the API,
 * not all child IDs, even though the UI shows all children as selected.
 */
export function extractCategoryIds(
  categoryOptions: Array<{ name: string; id: number }>,
  backendFilters: any
): number[] {
  const categories = backendFilters?.categories;
  if (!Array.isArray(categories) || categoryOptions.length === 0) {
    return [];
  }

  const selectedIds = new Set(categoryOptions.map((cat) => cat.id));
  const resultIds: number[] = [];
  const coveredByParent = new Set<number>(); // Children covered by a selected parent

  // First pass: identify parent categories that have all children selected
  // and mark their children as covered
  for (const categoryOption of categoryOptions) {
    const category = findCategoryById(categories, categoryOption.id);
    if (!category) {
      continue;
    }

    // Check if this category has children
    const childIds = getAllChildCategoryIds(category);
    if (childIds.length > 0) {
      // Check if all children are selected
      const allChildrenSelected = childIds.every((childId) =>
        selectedIds.has(childId)
      );

      if (allChildrenSelected && selectedIds.has(categoryOption.id)) {
        // Parent is selected with all children - mark children as covered
        childIds.forEach((childId) => coveredByParent.add(childId));
      }
    }
  }

  // Second pass: process categories, skipping children covered by parents
  const processedIds = new Set<number>();
  for (const categoryOption of categoryOptions) {
    if (processedIds.has(categoryOption.id)) {
      continue;
    }

    // Skip if this child is covered by a parent
    if (coveredByParent.has(categoryOption.id)) {
      continue;
    }

    const category = findCategoryById(categories, categoryOption.id);
    if (!category) {
      // Category not found in backend, use the ID from FilterOption
      resultIds.push(categoryOption.id);
      processedIds.add(categoryOption.id);
      continue;
    }

    // Check if this category has children
    const childIds = getAllChildCategoryIds(category);
    if (childIds.length > 0) {
      // Check if all children are selected
      const allChildrenSelected = childIds.every((childId) =>
        selectedIds.has(childId)
      );

      if (allChildrenSelected && selectedIds.has(categoryOption.id)) {
        // Parent is selected with all children - only add parent ID
        resultIds.push(categoryOption.id);
        processedIds.add(categoryOption.id);
        // Mark all children as processed so we don't add them
        childIds.forEach((childId) => processedIds.add(childId));
      } else {
        // Not all children are selected, or parent is not selected
        // Add this category ID if it's selected
        if (selectedIds.has(categoryOption.id)) {
          resultIds.push(categoryOption.id);
          processedIds.add(categoryOption.id);
        }
      }
    } else {
      // Leaf category (no children) - add it if selected
      if (selectedIds.has(categoryOption.id)) {
        resultIds.push(categoryOption.id);
        processedIds.add(categoryOption.id);
      }
    }
  }

  return resultIds;
}
