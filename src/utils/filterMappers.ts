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

  function findCategoryId(
    cats: any[],
    name: string
  ): number | undefined {
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

