import { getLocalizedText } from "./i18n";

/**
 * Extract ID from a filter option object
 * Handles both id and rrr_id fields
 */
export function extractId(item: any): number | undefined {
  if (item && typeof item === "object") {
    if (typeof item.id === "number") {
      return item.id;
    }
    // Fallback to rrr_id if id is not available
    if (typeof item.rrr_id === "number") {
      return item.rrr_id;
    }
    if (typeof item.rrr_id === "string") {
      const parsed = parseInt(item.rrr_id, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
  }
  return undefined;
}

/**
 * Extract display name from a filter option object or string
 * Handles localized text with fallback chain
 */
export function extractName(item: any): string {
  if (typeof item === "string") {
    return item;
  }
  if (item && typeof item === "object") {
    // Try localized text first (prioritizes Lithuanian, falls back to English)
    if (item.languages) {
      return getLocalizedText(item.languages, item.name || String(item));
    }
    // Fallback to name property or string conversion
    return item.name || String(item);
  }
  return String(item);
}

/**
 * Generic function to map a name to ID from a filter array
 */
export function mapNameToId(
  name: string,
  filterArray: any[] | undefined
): number | undefined {
  if (!Array.isArray(filterArray)) {
    return undefined;
  }

  for (const item of filterArray) {
    const itemName = extractName(item);
    if (itemName === name) {
      return extractId(item);
    }
  }
  return undefined;
}

/**
 * Map brand name to ID from backend filters
 */
export function mapBrandNameToId(
  brandName: string,
  backendFilters: any
): number | undefined {
  return mapNameToId(brandName, backendFilters?.car?.brands);
}

/**
 * Map model name to ID from backend filters
 * Models can be nested under brands, so we search through brands
 * @param modelName - The model name to find
 * @param backendFilters - The backend filters object
 * @param brandNames - Optional array of brand names to limit search scope
 */
export function mapModelNameToId(
  modelName: string,
  backendFilters: any,
  brandNames?: string[]
): number | undefined {
  if (!backendFilters?.car?.brands) {
    // Fallback: try flat models array if brands structure doesn't exist
    const models =
      backendFilters?.car?.models || backendFilters?.car?.car_models;
    return mapNameToId(modelName, models);
  }

  // Filter brands if brandNames provided
  const brandsToSearch = brandNames
    ? backendFilters.car.brands.filter((b: any) => {
        const brandName = extractName(b);
        return brandNames.includes(brandName);
      })
    : backendFilters.car.brands;

  // Search through brands to find the model
  for (const brand of brandsToSearch) {
    if (brand.models && Array.isArray(brand.models)) {
      const modelId = mapNameToId(modelName, brand.models);
      if (modelId !== undefined) {
        return modelId;
      }
    }
  }

  return undefined;
}

/**
 * Map fuel type name to ID from backend filters
 * Handles both fuel_types and fuels keys
 */
export function mapFuelTypeNameToId(
  fuelTypeName: string,
  backendFilters: any
): number | undefined {
  const fuelTypes =
    backendFilters?.car?.fuel_types || backendFilters?.car?.fuels;
  return mapNameToId(fuelTypeName, fuelTypes);
}

/**
 * Map body type name to ID from backend filters
 */
export function mapBodyTypeNameToId(
  bodyTypeName: string,
  backendFilters: any
): number | undefined {
  return mapNameToId(bodyTypeName, backendFilters?.car?.body_types);
}

/**
 * Map category name to ID from backend filters
 * Handles nested categories recursively
 */
export function mapCategoryNameToId(
  categoryName: string,
  backendFilters: any
): number | undefined {
  const categories = backendFilters?.categories;
  if (!Array.isArray(categories)) {
    return undefined;
  }

  function findCategoryId(cats: any[], name: string): number | undefined {
    for (const category of cats) {
      const catName = extractName(category);
      if (catName === name) {
        return extractId(category);
      }
      // Recursively search subcategories
      if (category.subcategories && Array.isArray(category.subcategories)) {
        const found = findCategoryId(category.subcategories, name);
        if (found !== undefined) {
          return found;
        }
      }
    }
    return undefined;
  }

  return findCategoryId(categories, categoryName);
}

/**
 * Get all child category names recursively for a given category
 */
function getAllChildCategoryNames(category: any): string[] {
  const names: string[] = [];
  if (category.subcategories && Array.isArray(category.subcategories)) {
    for (const subcat of category.subcategories) {
      names.push(extractName(subcat));
      // Recursively get grandchildren
      names.push(...getAllChildCategoryNames(subcat));
    }
  }
  return names;
}

/**
 * Find a category by name in the categories tree
 */
function findCategoryByName(cats: any[], name: string): any | undefined {
  for (const category of cats) {
    const catName = extractName(category);
    if (catName === name) {
      return category;
    }
    // Recursively search subcategories
    if (category.subcategories && Array.isArray(category.subcategories)) {
      const found = findCategoryByName(category.subcategories, name);
      if (found !== undefined) {
        return found;
      }
    }
  }
  return undefined;
}

/**
 * Convert category names to IDs, but only pass parent IDs when parent is selected with all children
 * This ensures that when a parent category is selected, we only send the parent ID to the API,
 * not all child IDs, even though the UI shows all children as selected.
 */
export function mapCategoryNamesToIds(
  categoryNames: string[],
  backendFilters: any
): number[] {
  const categories = backendFilters?.categories;
  if (!Array.isArray(categories) || categoryNames.length === 0) {
    return [];
  }

  const selectedSet = new Set(categoryNames);
  const resultIds: number[] = [];
  const coveredByParent = new Set<string>(); // Children covered by a selected parent

  // First pass: identify parent categories that have all children selected
  // and mark their children as covered
  for (const categoryName of categoryNames) {
    const category = findCategoryByName(categories, categoryName);
    if (!category) {
      continue;
    }

    // Check if this category has children
    const childNames = getAllChildCategoryNames(category);
    if (childNames.length > 0) {
      // Check if all children are selected
      const allChildrenSelected = childNames.every((childName) =>
        selectedSet.has(childName)
      );

      if (allChildrenSelected && selectedSet.has(categoryName)) {
        // Parent is selected with all children - mark children as covered
        childNames.forEach((childName) => coveredByParent.add(childName));
      }
    }
  }

  // Second pass: process categories, skipping children covered by parents
  const processedNames = new Set<string>();
  for (const categoryName of categoryNames) {
    if (processedNames.has(categoryName)) {
      continue;
    }

    // Skip if this child is covered by a parent
    if (coveredByParent.has(categoryName)) {
      continue;
    }

    const category = findCategoryByName(categories, categoryName);
    if (!category) {
      // Category not found, try to get ID anyway
      const id = mapCategoryNameToId(categoryName, backendFilters);
      if (id !== undefined) {
        resultIds.push(id);
        processedNames.add(categoryName);
      }
      continue;
    }

    // Check if this category has children
    const childNames = getAllChildCategoryNames(category);
    if (childNames.length > 0) {
      // Check if all children are selected
      const allChildrenSelected = childNames.every((childName) =>
        selectedSet.has(childName)
      );

      if (allChildrenSelected && selectedSet.has(categoryName)) {
        // Parent is selected with all children - only add parent ID
        const parentId = extractId(category);
        if (parentId !== undefined) {
          resultIds.push(parentId);
          processedNames.add(categoryName);
          // Mark all children as processed so we don't add them
          childNames.forEach((childName) => processedNames.add(childName));
        }
      } else {
        // Not all children are selected, or parent is not selected
        // Add this category ID if it's selected
        if (selectedSet.has(categoryName)) {
          const id = extractId(category);
          if (id !== undefined) {
            resultIds.push(id);
            processedNames.add(categoryName);
          }
        }
      }
    } else {
      // Leaf category (no children) - add it if selected
      if (selectedSet.has(categoryName)) {
        const id = extractId(category);
        if (id !== undefined) {
          resultIds.push(id);
          processedNames.add(categoryName);
        }
      }
    }
  }

  return resultIds;
}

/**
 * Map quality name to ID from backend filters
 */
export function mapQualityNameToId(
  qualityName: string,
  backendFilters: any
): number | undefined {
  return mapNameToId(qualityName, backendFilters?.parts?.qualities);
}

/**
 * Map position name to ID from backend filters
 */
export function mapPositionNameToId(
  positionName: string,
  backendFilters: any
): number | undefined {
  return mapNameToId(positionName, backendFilters?.parts?.positions);
}

/**
 * Map status name to ID from backend filters
 */
export function mapStatusNameToId(
  statusName: string,
  backendFilters: any
): number | undefined {
  return mapNameToId(statusName, backendFilters?.parts?.statuses);
}
