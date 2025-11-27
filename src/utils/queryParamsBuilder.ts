import { FilterState, FilterOption } from "@/types";
import { extractCategoryIds } from "@/utils/filterHelpers";

/**
 * Extract IDs from FilterOption array, preferring rrr_id over id
 */
export const extractIds = (
  options: FilterOption[] | undefined,
  useRrrId: boolean = true
): (string | number)[] => {
  if (!options || options.length === 0) return [];
  return options.map((opt) => (useRrrId ? opt.rrr_id ?? opt.id : opt.id));
};

/**
 * Configuration for which filters to include
 */
export interface QueryParamsConfig {
  /** Include date range filters (date_from, date_to) */
  includeDateRange?: boolean;
  /** Include fuel type filter */
  includeFuelType?: boolean;
  /** Include wheel drive filter */
  includeWheelDrive?: boolean;
  /** Include sort_by from topDetailsFilter */
  includeTopDetails?: boolean;
  /** Use rrr_id for status extraction (false = use just id) */
  useRrrIdForStatus?: boolean;
  /** Use order_status param name instead of status (for orders API) */
  useOrderStatusParam?: boolean;
}

/**
 * Base query params that all endpoints share
 */
export interface BaseQueryParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: (string | number)[];
  order_status?: string[];
  brand_id?: (string | number)[];
  model_id?: (string | number)[];
  year_from?: number;
  year_to?: number;
  category_id?: (string | number)[];
  quality?: (string | number)[];
  position?: (string | number)[];
  body_type_id?: (string | number)[];
  price_from?: number;
  price_to?: number;
  engine_volume_from?: number;
  engine_volume_to?: number;
  rims_fixing_points_id?: (string | number)[];
  rims_spacing_id?: (string | number)[];
  rims_central_diameter_id?: (string | number)[];
  tires_height_id?: (string | number)[];
  tires_width_id?: (string | number)[];
  // Optional fields based on config
  date_from?: string;
  date_to?: string;
  fuel_id?: (string | number)[];
  wheel_drive_id?: (string | number)[];
  sort_by?:
    | "sold_most"
    | "sold_least"
    | "never_sold"
    | "price_asc"
    | "price_desc";
}

/**
 * Build query parameters from FilterState
 *
 * @param filters - The filter state
 * @param pagination - Optional pagination params
 * @param backendFilters - Backend filters for category extraction
 * @param config - Configuration for which filters to include
 * @param topDetailsFilter - Optional top details filter value (for parts)
 * @returns Query parameters object
 */
export function buildQueryParams<T extends BaseQueryParams>(
  filters: FilterState,
  pagination?: { page?: number; per_page?: number },
  backendFilters?: any,
  config: QueryParamsConfig = {},
  topDetailsFilter?: string
): T {
  const {
    includeDateRange = false,
    includeFuelType = false,
    includeWheelDrive = false,
    includeTopDetails = false,
    useRrrIdForStatus = true,
    useOrderStatusParam = false,
  } = config;

  const params: BaseQueryParams = {
    ...pagination,
  };

  // Top details filter (parts only)
  if (
    includeTopDetails &&
    topDetailsFilter &&
    topDetailsFilter !== "be-filtro"
  ) {
    const sortByMap: Record<string, "sold_most" | "sold_least" | "never_sold"> =
      {
        "top-detales": "sold_most",
        "reciausiai-parduodamos": "sold_least",
      };
    const sortBy = sortByMap[topDetailsFilter];
    if (sortBy) {
      params.sort_by = sortBy;
    }
  }

  // Search
  if (filters.search?.trim()) {
    params.search = filters.search.trim();
  }

  // Status
  if (
    filters.status !== "All" &&
    Array.isArray(filters.status) &&
    filters.status.length > 0
  ) {
    if (useOrderStatusParam) {
      // For orders API: use order_status param with string values (e.g., "NEW", "SENT")
      const statusNames = filters.status.map((s) => String(s.rrr_id ?? s.name));
      if (statusNames.length > 0) {
        params.order_status = statusNames;
      }
    } else {
      const statusIds = extractIds(filters.status, useRrrIdForStatus);
      if (statusIds.length > 0) {
        params.status = statusIds;
      }
    }
  }

  // Date range (orders/returns only)
  if (includeDateRange) {
    if (filters.dateRange?.from) {
      params.date_from = filters.dateRange.from.toISOString().split("T")[0];
    }
    if (filters.dateRange?.to) {
      params.date_to = filters.dateRange.to.toISOString().split("T")[0];
    }
  }

  // Car filters
  const brandIds = extractIds(filters.carBrand);
  if (brandIds.length > 0) {
    params.brand_id = brandIds;
  }

  const modelIds = extractIds(filters.carModel);
  if (modelIds.length > 0) {
    params.model_id = modelIds;
  }

  // Year range
  if (filters.yearRange?.min !== undefined) {
    params.year_from = filters.yearRange.min;
  }
  if (filters.yearRange?.max !== undefined) {
    params.year_to = filters.yearRange.max;
  }

  // Part category (with special extraction logic)
  if (filters.partCategory && filters.partCategory.length > 0) {
    const categoryIds = extractCategoryIds(
      filters.partCategory,
      backendFilters
    );
    if (categoryIds.length > 0) {
      params.category_id = categoryIds;
    }
  }

  // Quality
  const qualityIds = extractIds(filters.quality);
  if (qualityIds.length > 0) {
    params.quality = qualityIds;
  }

  // Position
  const positionIds = extractIds(filters.position);
  if (positionIds.length > 0) {
    params.position = positionIds;
  }

  // Body type
  const bodyTypeIds = extractIds(filters.bodyType);
  if (bodyTypeIds.length > 0) {
    params.body_type_id = bodyTypeIds;
  }

  // Price range
  if (filters.priceRange?.min !== undefined) {
    params.price_from = filters.priceRange.min;
  }
  if (filters.priceRange?.max !== undefined) {
    params.price_to = filters.priceRange.max;
  }

  // Fuel type (orders/returns only)
  if (includeFuelType) {
    const fuelIds = extractIds(filters.fuelType);
    if (fuelIds.length > 0) {
      params.fuel_id = fuelIds;
    }
  }

  // Engine capacity range
  if (filters.engineCapacityRange?.min !== undefined) {
    params.engine_volume_from = filters.engineCapacityRange.min;
  }
  if (filters.engineCapacityRange?.max !== undefined) {
    params.engine_volume_to = filters.engineCapacityRange.max;
  }

  // Wheel drive (orders/returns only)
  if (includeWheelDrive) {
    const driveIds = extractIds(filters.wheelDrive);
    if (driveIds.length > 0) {
      params.wheel_drive_id = driveIds;
    }
  }

  // Wheel filters (all endpoints)
  const fixingPointsIds = extractIds(filters.wheelFixingPoints);
  if (fixingPointsIds.length > 0) {
    params.rims_fixing_points_id = fixingPointsIds;
  }

  const spacingIds = extractIds(filters.wheelSpacing);
  if (spacingIds.length > 0) {
    params.rims_spacing_id = spacingIds;
  }

  const centralDiameterIds = extractIds(filters.wheelCentralDiameter);
  if (centralDiameterIds.length > 0) {
    params.rims_central_diameter_id = centralDiameterIds;
  }

  const heightIds = extractIds(filters.wheelHeight);
  if (heightIds.length > 0) {
    params.tires_height_id = heightIds;
  }

  const widthIds = extractIds(filters.wheelWidth);
  if (widthIds.length > 0) {
    params.tires_width_id = widthIds;
  }

  return params as T;
}

/**
 * Pre-configured builder for Parts API
 */
export const buildPartsQueryParams = (
  filters: FilterState,
  pagination?: { page?: number; per_page?: number },
  backendFilters?: any,
  topDetailsFilter?: string
) =>
  buildQueryParams(
    filters,
    pagination,
    backendFilters,
    {
      includeTopDetails: true,
      useRrrIdForStatus: true,
    },
    topDetailsFilter
  );

/**
 * Pre-configured builder for Orders API
 */
export const buildOrdersQueryParams = (
  filters: FilterState,
  pagination?: { page?: number; per_page?: number },
  backendFilters?: any
) =>
  buildQueryParams(filters, pagination, backendFilters, {
    includeDateRange: true,
    includeFuelType: true,
    includeWheelDrive: true,
    useOrderStatusParam: true, // Orders uses order_status param with string values
  });

/**
 * Pre-configured builder for Returns API
 */
export const buildReturnsQueryParams = (
  filters: FilterState,
  pagination?: { page?: number; per_page?: number },
  backendFilters?: any
) =>
  buildQueryParams(filters, pagination, backendFilters, {
    includeDateRange: true,
    includeFuelType: true,
    includeWheelDrive: true,
    useRrrIdForStatus: true,
  });
