import authInstance from "./axios";
import { Part, PartPosition, FilterState } from "@/types";
import { apiEndpoints, PartsQueryParams } from "./routes/routes";
import { BackendFilters } from "@/utils/backendFilters";
import { getLocalizedText } from "@/utils/i18n";
import { buildPartsQueryParams } from "@/utils/queryParamsBuilder";

// API Response types
interface ApiPartResponse {
  id: number;
  part_id: number;
  name: string;
  price: string;
  external_id: string | null;
  id_bridge: string;
  manufacturer_code: string;
  visible_code: string;
  other_code: string;
  sticker_note: string;
  quality: number;
  notes: string;
  internal_notes: string;
  status: number; // 0 = In Stock, 1 = Reserved, 2 = Sold
  reserved_user: number;
  reserved_date: string | null;
  currency: string;
  original_price: string;
  original_currency: string;
  position: number;
  mechanic: number;
  rims: number;
  tires: number;
  rims_quantity: number | null;
  tires_quantity: number | null;
  photo: string;
  part_photo_gallery: string[];
  shop_url: string;
  show_url: string | null;
  date: string;
  create_date: string;
  rims_fixing_points_info: string | null;
  rims_spacing_info: string | null;
  rims_central_diameter_info: string | null;
  tires_width_info: string | null;
  tires_height_info: string | null;
  // Expandable parts fields
  part_ids?: number[];
  items_count?: number;
  qualities?: Record<string, number>;
  statuses?: Record<string, number>;
  price_min?: number;
  price_max?: number;
  price_avg?: number;
  total_sold?: number;
  time_in_warehouse_days?: number;
  car: {
    id: number;
    rrr_id: number;
    car_body_number: string;
    car_engine_number: string;
    car_years: string;
    car_model_years: string;
    car_engine_cubic_capacity: string | null;
    car_engine_power: string | null;
    car_engine_type: string;
    car_engine_code: string | null;
    car_gearbox_code: string;
    car_color_code: string | null;
    car_interior: string;
    car_mileage: string | null;
    defectation_notes: string;
    photo: string | null;
    car_photo_gallery: string[];
    last_synced_at: string;
    created_at: string;
    updated_at: string;
    car_model: {
      id: number;
      rrr_id: string;
      name: string;
      year_start: string;
      year_end: string;
      brand: {
        id: number;
        rrr_id: string;
        name: string;
      };
    };
    car_fuel?: {
      id: number;
      rrr_id: string;
      name: string;
      languages?: Record<string, string>;
    } | null;
    category?: {
      id: number;
      rrr_id: string;
      name: string;
      languages?: Record<string, string> | string;
    } | null;
  } | null;
  rims_fixing_points: number | null;
  rims_spacing: number | null;
  rims_central_diameter: number | null;
  tires_width: number | null;
  tires_height: number | null;
}

interface ApiPartsResponse {
  success: boolean;
  data: ApiPartResponse[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

// Get all parts with pagination
export interface PartsResponse {
  parts: Part[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

// Map status number to string - used as fallback when backend filters unavailable
// The actual status name should come from backend filters via getLocalizedStatus
function mapStatus(status: number): string {
  switch (status) {
    case 0:
      return "In Stock";
    case 1:
      return "Reserved";
    case 2:
      return "Sold";
    case 3:
      return "Returned";
    default:
      return "In Stock";
  }
}

// Store quality ID for later mapping with backend filters
function getQualityId(quality: number): number | undefined {
  // Return undefined if quality is 0 or invalid
  if (!quality || quality === 0) return undefined;
  return quality;
}

// Map position number to PartPosition
// Note: Position values from API (0, 80, 90) don't directly map to Left/Right/Front/Rear/Set
// This might need adjustment based on actual API documentation
function mapPosition(_position: number): PartPosition | undefined {
  // Position values in API seem to be numeric codes, not direct mappings
  // For now, return undefined unless we have clear mapping
  // TODO: Verify position mapping with API documentation
  return undefined;
}

// Calculate days in inventory
function calculateDaysInInventory(dateAdded: string): number {
  const now = new Date();
  const date = new Date(dateAdded);
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Get localized status from backend filters
function getLocalizedStatus(statusId: number, backendFilters?: any): string {
  if (!backendFilters?.parts?.statuses) {
    return mapStatus(statusId);
  }

  // Try to find by ID first
  let statusOption = backendFilters.parts.statuses.find(
    (s: any) => typeof s === "object" && s.rrr_id == statusId
  );

  // If not found, try matching by English name fallback
  if (!statusOption) {
    const englishStatus = mapStatus(statusId).toLowerCase();
    statusOption = backendFilters.parts.statuses.find(
      (s: any) =>
        typeof s === "object" &&
        (s.name?.toLowerCase() === englishStatus ||
          s.languages?.en?.toLowerCase() === englishStatus)
    );
  }

  if (statusOption) {
    return getLocalizedText(statusOption.languages, statusOption.name);
  }

  return mapStatus(statusId);
}

// Transform API response to Part type
function transformApiPart(
  apiPart: ApiPartResponse,
  backendFilters?: any
): Part {
  const dateAdded = new Date(apiPart.date || apiPart.create_date).toISOString();
  const photos = [
    ...(apiPart.photo ? [apiPart.photo] : []),
    ...(apiPart.part_photo_gallery || []),
  ].filter((photo): photo is string => photo !== null && photo !== "");

  // Calculate price in PLN (assuming 1 EUR = 4.5 PLN, adjust as needed)
  const priceEUR = parseFloat(apiPart.price) || 0;
  const pricePLN = priceEUR * 4.5; // TODO: Use actual exchange rate if available

  // Extract category from car object
  let categoryName = "";
  if (apiPart.car?.category) {
    const category = apiPart.car.category;
    categoryName = getLocalizedText(category.languages, category.name);
  }

  return {
    id: apiPart.id.toString(),
    part_id: apiPart.part_id,
    code: apiPart.part_id.toString(),
    name: apiPart.name,
    category: categoryName,
    partType: "", // TODO: Get part type from API if available
    carId: apiPart.car?.id?.toString() || "",
    carBrand: apiPart.car?.car_model?.brand?.name || "",
    carModel: apiPart.car?.car_model?.name || "",
    carYear: apiPart.car?.car_years ? parseInt(apiPart.car.car_years) || 0 : 0,
    manufacturerCode: apiPart.manufacturer_code || undefined,
    status: getLocalizedStatus(apiPart.status, backendFilters),
    statusId: apiPart.status,
    priceEUR,
    pricePLN,
    position: mapPosition(apiPart.position),
    daysInInventory: calculateDaysInInventory(dateAdded),
    dateAdded,
    dateSold:
      apiPart.status === 2 && apiPart.reserved_date
        ? new Date(apiPart.reserved_date).toISOString()
        : apiPart.status === 2
        ? dateAdded
        : undefined,
    photos,
    warehouse: undefined, // TODO: Get warehouse from API if available
    fuelType: apiPart.car?.car_fuel
      ? getLocalizedText(
          apiPart.car.car_fuel.languages,
          apiPart.car.car_fuel.name
        )
      : undefined,
    engineVolume: apiPart.car?.car_engine_cubic_capacity || undefined,
    qualityId: getQualityId(apiPart.quality),
    // Expandable parts fields
    part_ids: apiPart.part_ids,
    items_count: apiPart.items_count,
    qualities: apiPart.qualities,
    statuses: apiPart.statuses,
    price_min: apiPart.price_min,
    price_max: apiPart.price_max,
    price_avg: apiPart.price_avg,
    total_sold: apiPart.total_sold,
    time_in_warehouse_days: apiPart.time_in_warehouse_days,
    isExpanded: apiPart.part_ids && apiPart.part_ids.length > 1 ? true : false, // Default expanded if has child parts
    childParts: [], // Will be populated when fetching child parts
    isChildPart: false,
    // Wheel-specific fields
    wheelDrive: undefined, // TODO: Map from car data if available
    wheelSide: undefined, // TODO: Map from API if available
    wheelCentralDiameter: apiPart.rims_central_diameter || undefined,
    wheelFixingPoints: apiPart.rims_fixing_points || undefined,
    wheelHeight: apiPart.tires_height || undefined,
    wheelSpacing: apiPart.rims_spacing || undefined,
    wheelTreadDepth: undefined, // Not in API response
    wheelWidth: apiPart.tires_width || undefined,
  };
}

/**
 * Convert FilterState to PartsQueryParams for API requests
 */
export const filterStateToQueryParams = (
  filters: FilterState,
  pagination?: { page?: number; per_page?: number },
  backendFilters?: any,
  topDetailsFilter?: string
): PartsQueryParams => {
  return buildPartsQueryParams(
    filters,
    pagination,
    backendFilters,
    topDetailsFilter
  );
};

// Get all parts
export const getParts = async (
  queryParams?: PartsQueryParams,
  backendFilters?: any
): Promise<PartsResponse> => {
  const response = await authInstance.get<ApiPartsResponse>(
    apiEndpoints.getParts(queryParams)
  );
  const result = {
    parts: response.data.data.map((part) =>
      transformApiPart(part, backendFilters)
    ),
    pagination: response.data.pagination,
  };
  return result;
};

// Get multiple parts by comma-separated IDs
export const getPartsByIds = async (
  ids: number[],
  backendFilters?: any
): Promise<Part[]> => {
  const idsString = ids.join(",");
  const endpoint = `/parts/${idsString}`;

  try {
    const response = await authInstance.get(endpoint);

    if (!response.data.success) {
      return [];
    }

    // Handle both single part response (object) and multiple parts response (array)
    let partsData: ApiPartResponse[] = [];

    if (Array.isArray(response.data.data)) {
      // Multiple parts response: data is array
      partsData = response.data.data;
    } else if (response.data.data && typeof response.data.data === "object") {
      // Single part response: data is object, wrap in array
      partsData = [response.data.data];
    } else {
      // No data or null
      return [];
    }

    const transformedParts = partsData.map((part) =>
      transformApiPart(part, backendFilters)
    );
    return transformedParts;
  } catch (error) {
    console.error(`API Error for endpoint ${endpoint}:`, error);
    throw error;
  }
};

// Get filters for parts (using same endpoint as cars, which includes categories)
export const getFilters = async (): Promise<BackendFilters> => {
  const response = await authInstance.get<BackendFilters>(
    apiEndpoints.getFilters()
  );
  return response.data;
};
