import authInstance from "./axios";
import {
  Part,
  PartStatus,
  PartPosition,
  PartQuality,
  FilterState,
} from "@/types";
import { apiEndpoints, PartsQueryParams } from "./routes/routes";
import { BackendFilters, Category } from "@/utils/backendFilters";
import { getLocalizedText } from "@/utils/i18n";
import { extractCategoryIds } from "@/utils/filterHelpers";

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

// Map status number to PartStatus
function mapStatus(status: number): PartStatus {
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

// Map quality number to PartQuality (this is a placeholder - adjust based on actual API mapping)
function mapQuality(quality: number): PartQuality | undefined {
  // TODO: Map quality number to PartQuality based on actual API response
  // For now, return undefined if quality is 0 or invalid
  if (!quality || quality === 0) return undefined;
  // This is a placeholder - adjust based on actual quality mapping from backend
  return "Used"; // Default fallback
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
function calculateDaysInInventory(dateAdded: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - dateAdded.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// Transform API response to Part type
function transformApiPart(apiPart: ApiPartResponse): Part {
  const dateAdded = new Date(apiPart.date || apiPart.create_date);
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
    code: apiPart.part_id.toString(),
    name: apiPart.name,
    category: categoryName,
    partType: "", // TODO: Get part type from API if available
    carId: apiPart.car?.id?.toString() || "",
    carBrand: apiPart.car?.car_model?.brand?.name || "",
    carModel: apiPart.car?.car_model?.name || "",
    carYear: apiPart.car?.car_years ? parseInt(apiPart.car.car_years) || 0 : 0,
    manufacturerCode: apiPart.manufacturer_code || undefined,
    status: mapStatus(apiPart.status),
    priceEUR,
    pricePLN,
    position: mapPosition(apiPart.position),
    daysInInventory: calculateDaysInInventory(dateAdded),
    dateAdded,
    dateSold:
      apiPart.status === 2 && apiPart.reserved_date
        ? new Date(apiPart.reserved_date)
        : apiPart.status === 2
        ? dateAdded
        : undefined,
    photos,
    warehouse: undefined, // TODO: Get warehouse from API if available
    fuelType: apiPart.car?.car_engine_type || undefined,
    engineVolume: apiPart.car?.car_engine_cubic_capacity || undefined,
    quality: mapQuality(apiPart.quality),
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
  backendFilters?: any
): PartsQueryParams => {
  const params: PartsQueryParams = {
    ...pagination,
  };

  // Search
  if (filters.search && filters.search.trim()) {
    params.search = filters.search.trim();
  }

  // Status - extract IDs directly from FilterOption objects
  if (
    filters.status !== "All" &&
    Array.isArray(filters.status) &&
    filters.status.length > 0
  ) {
    const statusIds = filters.status.map((status) => status.id);
    if (statusIds.length > 0) {
      params.status = statusIds;
    }
  }

  // Car filters - extract IDs directly from FilterOption objects
  if (filters.carBrand && filters.carBrand.length > 0) {
    const brandIds = filters.carBrand.map((brand) => brand.id);
    if (brandIds.length > 0) {
      params.car_brand = brandIds;
    }
  }
  if (filters.carModel && filters.carModel.length > 0) {
    const modelIds = filters.carModel.map((model) => model.id);
    if (modelIds.length > 0) {
      params.car_model = modelIds;
    }
  }
  if (filters.carYear && filters.carYear.length > 0) {
    params.car_year = filters.carYear;
  }

  // Year range
  if (filters.yearRange?.min !== undefined) {
    params.year_min = filters.yearRange.min;
  }
  if (filters.yearRange?.max !== undefined) {
    params.year_max = filters.yearRange.max;
  }

  // Part filters - extract IDs directly from FilterOption objects
  // Only pass parent IDs when parent is selected with all children
  if (filters.partCategory && filters.partCategory.length > 0) {
    const categoryIds = extractCategoryIds(
      filters.partCategory,
      backendFilters
    );
    if (categoryIds.length > 0) {
      params.category = categoryIds;
    }
  }
  if (filters.partType && filters.partType.length > 0) {
    params.part_type = filters.partType.map((type) => type.name);
  }
  if (filters.quality && filters.quality.length > 0) {
    const qualityIds = filters.quality.map((quality) => quality.id);
    if (qualityIds.length > 0) {
      params.quality = qualityIds;
    }
  }
  if (filters.position && filters.position.length > 0) {
    const positionIds = filters.position.map((position) => position.id);
    if (positionIds.length > 0) {
      params.position = positionIds;
    }
  }

  // Body type - extract IDs directly from FilterOption objects
  if (filters.bodyType && filters.bodyType.length > 0) {
    const bodyTypeIds = filters.bodyType.map((bodyType) => bodyType.id);
    if (bodyTypeIds.length > 0) {
      params.body_type = bodyTypeIds;
    }
  }

  // Price range
  if (filters.priceRange?.min !== undefined) {
    params.price_min = filters.priceRange.min;
  }
  if (filters.priceRange?.max !== undefined) {
    params.price_max = filters.priceRange.max;
  }

  // Engine capacity range
  if (filters.engineCapacityRange?.min !== undefined) {
    params.engine_volume_min = filters.engineCapacityRange.min;
  }
  if (filters.engineCapacityRange?.max !== undefined) {
    params.engine_volume_max = filters.engineCapacityRange.max;
  }

  // Wheel filters - extract IDs directly from FilterOption objects
  if (filters.wheelDrive && filters.wheelDrive.length > 0) {
    const wheelDriveIds = filters.wheelDrive.map((drive) => drive.id);
    if (wheelDriveIds.length > 0) {
      params.wheel_drive = wheelDriveIds;
    }
  }
  if (filters.wheelSide && filters.wheelSide.length > 0) {
    const wheelSideIds = filters.wheelSide.map((side) => side.id);
    if (wheelSideIds.length > 0) {
      params.wheel_side = wheelSideIds;
    }
  }
  // Wheel filters - extract IDs directly from FilterOption objects
  if (filters.wheelCentralDiameter && filters.wheelCentralDiameter.length > 0) {
    const centralDiameterIds = filters.wheelCentralDiameter.map(
      (diameter) => diameter.id
    );
    if (centralDiameterIds.length > 0) {
      params.wheel_central_diameter = centralDiameterIds;
    }
  }
  if (filters.wheelFixingPoints && filters.wheelFixingPoints.length > 0) {
    const fixingPointsIds = filters.wheelFixingPoints.map(
      (points) => points.id
    );
    if (fixingPointsIds.length > 0) {
      params.wheel_fixing_points = fixingPointsIds;
    }
  }
  if (filters.wheelHeight && filters.wheelHeight.length > 0) {
    const heightIds = filters.wheelHeight.map((height) => height.id);
    if (heightIds.length > 0) {
      params.wheel_height = heightIds;
    }
  }
  if (filters.wheelSpacing && filters.wheelSpacing.length > 0) {
    const spacingIds = filters.wheelSpacing.map((spacing) => spacing.id);
    if (spacingIds.length > 0) {
      params.wheel_spacing = spacingIds;
    }
  }
  if (filters.wheelTreadDepth && filters.wheelTreadDepth.length > 0) {
    const treadDepthIds = filters.wheelTreadDepth.map((depth) => depth.id);
    if (treadDepthIds.length > 0) {
      params.wheel_tread_depth = treadDepthIds;
    }
  }
  if (filters.wheelWidth && filters.wheelWidth.length > 0) {
    const widthIds = filters.wheelWidth.map((width) => width.id);
    if (widthIds.length > 0) {
      params.wheel_width = widthIds;
    }
  }

  // Stale inventory
  if (filters.staleMonths !== undefined) {
    params.stale_months = filters.staleMonths;
  }

  // Warehouse - extract names from FilterOption objects (warehouse might be string[])
  if (filters.warehouse && filters.warehouse.length > 0) {
    params.warehouse = filters.warehouse.map((w) => w.name);
  }

  return params;
};

// Get all parts
export const getParts = async (
  queryParams?: PartsQueryParams
): Promise<PartsResponse> => {
  const response = await authInstance.get<ApiPartsResponse>(
    apiEndpoints.getParts(queryParams)
  );
  const result = {
    parts: response.data.data.map(transformApiPart),
    pagination: response.data.pagination,
  };
  return result;
};

// Get a single part by ID
export const getPart = async (id: string): Promise<Part> => {
  const response = await authInstance.get(apiEndpoints.getPartById(id));
  return response.data;
};

// Create a new part
export const createPart = async (part: Omit<Part, "id">): Promise<Part> => {
  const response = await authInstance.post(apiEndpoints.createPart(), part);
  return response.data;
};

// Update a part
export const updatePart = async (
  id: string,
  part: Partial<Part>
): Promise<Part> => {
  const response = await authInstance.put(apiEndpoints.updatePart(id), part);
  return response.data;
};

// Delete a part
export const deletePart = async (id: string): Promise<void> => {
  await authInstance.delete(apiEndpoints.deletePart(id));
};

// Get filters for parts (using same endpoint as cars, which includes categories)
export const getFilters = async (): Promise<BackendFilters> => {
  const response = await authInstance.get<BackendFilters>(
    apiEndpoints.getFilters()
  );
  return response.data;
};
