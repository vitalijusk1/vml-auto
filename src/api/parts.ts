import authInstance from "./axios";
import { Part, PartStatus, PartPosition, FilterState } from "@/types";
import { apiEndpoints, PartsQueryParams } from "./routes/routes";
import { CarFilters, Category } from "@/utils/filterCars";

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
  };
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

// Helper function to extract ID from FilterOption or return undefined
function extractId(item: any): number | undefined {
  if (item && typeof item === "object" && typeof item.id === "number") {
    return item.id;
  }
  return undefined;
}

// Helper function to get name from FilterOption or string
function extractName(item: any): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    if (item.languages?.en) return item.languages.en;
    if (item.languages?.name) return item.languages.name;
    if (item.name) return item.name;
  }
  return String(item);
}

// Generic function to map name to ID from a filter array
function mapNameToId(
  name: string,
  filterArray: any[] | undefined
): number | undefined {
  if (!Array.isArray(filterArray)) return undefined;

  for (const item of filterArray) {
    const itemName = extractName(item);
    if (itemName === name) {
      return extractId(item);
    }
  }
  return undefined;
}

// Map quality name to ID from backend filters
function mapQualityNameToId(
  qualityName: string,
  backendFilters: any
): number | undefined {
  return mapNameToId(qualityName, backendFilters?.parts?.qualities);
}

// Map brand name to ID from backend filters
function mapBrandNameToId(
  brandName: string,
  backendFilters: any
): number | undefined {
  return mapNameToId(brandName, backendFilters?.car?.brands);
}

// Map model name to ID from backend filters
function mapModelNameToId(
  modelName: string,
  backendFilters: any
): number | undefined {
  const models = backendFilters?.car?.models || backendFilters?.car?.car_models;
  return mapNameToId(modelName, models);
}

// Map body type name to ID from backend filters
function mapBodyTypeNameToId(
  bodyTypeName: string,
  backendFilters: any
): number | undefined {
  return mapNameToId(bodyTypeName, backendFilters?.car?.body_types);
}

// Map status name to ID from backend filters
function mapStatusNameToId(
  statusName: string,
  backendFilters: any
): number | undefined {
  return mapNameToId(statusName, backendFilters?.parts?.statuses);
}

// Map position name to ID from backend filters
function mapPositionNameToId(
  positionName: string,
  backendFilters: any
): number | undefined {
  return mapNameToId(positionName, backendFilters?.parts?.positions);
}

// Helper function to get category name (prefer English, fallback to name)
function getCategoryName(category: Category): string {
  return category.languages?.en || category.languages?.name || category.name;
}

// Helper function to recursively find category ID by name
function findCategoryIdByName(
  categories: Category[],
  categoryName: string
): number | undefined {
  for (const category of categories) {
    const name = getCategoryName(category);
    if (name === categoryName) {
      return category.id;
    }
    if (category.subcategories && category.subcategories.length > 0) {
      const found = findCategoryIdByName(category.subcategories, categoryName);
      if (found !== undefined) {
        return found;
      }
    }
  }
  return undefined;
}

// Map category name to ID from backend filters
function mapCategoryNameToId(
  categoryName: string,
  backendFilters: any
): number | undefined {
  const categories = backendFilters?.categories;
  if (!Array.isArray(categories)) return undefined;
  return findCategoryIdByName(categories, categoryName);
}

// Map position number to PartPosition
// Note: Position values from API (0, 80, 90) don't directly map to Left/Right/Front/Rear/Set
// This might need adjustment based on actual API documentation
function mapPosition(position: number): PartPosition | undefined {
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
  if (apiPart.car.category) {
    const category = apiPart.car.category;
    if (typeof category.languages === "string") {
      categoryName = category.languages;
    } else if (category.languages?.en) {
      categoryName = category.languages.en;
    } else {
      categoryName = category.name;
    }
  }

  return {
    id: apiPart.id.toString(),
    code: apiPart.part_id.toString(),
    name: apiPart.name,
    category: categoryName,
    partType: "", // TODO: Get part type from API if available
    carId: apiPart.car.id.toString(),
    carBrand: apiPart.car.car_model.brand.name,
    carModel: apiPart.car.car_model.name,
    carYear: parseInt(apiPart.car.car_years) || 0,
    manufacturerCode: apiPart.manufacturer_code || undefined,
    status: mapStatus(apiPart.status),
    priceEUR,
    pricePLN,
    position: mapPosition(apiPart.position),
    daysInInventory: calculateDaysInInventory(dateAdded),
    dateAdded,
    dateSold: apiPart.status === 2 && apiPart.reserved_date 
      ? new Date(apiPart.reserved_date) 
      : apiPart.status === 2 
        ? dateAdded 
        : undefined,
    photos,
    warehouse: undefined, // TODO: Get warehouse from API if available
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

  // Status - convert "All" to undefined, otherwise convert names to IDs
  if (filters.status !== "All" && Array.isArray(filters.status) && filters.status.length > 0) {
    const statusIds = filters.status
      .map((statusName) => mapStatusNameToId(statusName, backendFilters))
      .filter((id): id is number => id !== undefined);
    if (statusIds.length > 0) {
      params.status = statusIds;
    }
  }

  // Car filters - convert names to IDs
  if (filters.carBrand && filters.carBrand.length > 0) {
    const brandIds = filters.carBrand
      .map((brandName) => mapBrandNameToId(brandName, backendFilters))
      .filter((id): id is number => id !== undefined);
    if (brandIds.length > 0) {
      params.car_brand = brandIds;
    }
  }
  if (filters.carModel && filters.carModel.length > 0) {
    const modelIds = filters.carModel
      .map((modelName) => mapModelNameToId(modelName, backendFilters))
      .filter((id): id is number => id !== undefined);
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

  // Part filters - convert category names to IDs
  if (filters.partCategory && filters.partCategory.length > 0) {
    const categoryIds = filters.partCategory
      .map((categoryName) => mapCategoryNameToId(categoryName, backendFilters))
      .filter((id): id is number => id !== undefined);
    if (categoryIds.length > 0) {
      params.category = categoryIds;
    }
  }
  if (filters.partType && filters.partType.length > 0) {
    params.part_type = filters.partType;
  }
  if (filters.quality && filters.quality.length > 0) {
    // Convert quality names to IDs from backend filters
    const qualityIds = filters.quality
      .map((qualityName) => mapQualityNameToId(qualityName, backendFilters))
      .filter((id): id is number => id !== undefined);
    if (qualityIds.length > 0) {
      params.quality = qualityIds;
    }
  }
  if (filters.position && filters.position.length > 0) {
    // Convert position names to IDs
    const positionIds = filters.position
      .map((positionName) => mapPositionNameToId(positionName, backendFilters))
      .filter((id): id is number => id !== undefined);
    if (positionIds.length > 0) {
      params.position = positionIds;
    }
  }

  // Body type - convert names to IDs
  if (filters.bodyType && filters.bodyType.length > 0) {
    const bodyTypeIds = filters.bodyType
      .map((bodyTypeName) => mapBodyTypeNameToId(bodyTypeName, backendFilters))
      .filter((id): id is number => id !== undefined);
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

  // Wheel filters - convert names to IDs
  if (filters.wheelDrive && filters.wheelDrive.length > 0) {
    const wheelDriveIds = filters.wheelDrive
      .map((driveName) => mapNameToId(driveName, backendFilters?.wheels?.drives || backendFilters?.wheels?.wheel_drives))
      .filter((id): id is number => id !== undefined);
    if (wheelDriveIds.length > 0) {
      params.wheel_drive = wheelDriveIds;
    }
  }
  if (filters.wheelSide && filters.wheelSide.length > 0) {
    const wheelSideIds = filters.wheelSide
      .map((sideName) => mapNameToId(sideName, backendFilters?.wheels?.wheels))
      .filter((id): id is number => id !== undefined);
    if (wheelSideIds.length > 0) {
      params.wheel_side = wheelSideIds;
    }
  }
  if (filters.wheelCentralDiameter && filters.wheelCentralDiameter.length > 0) {
    const centralDiameterIds = filters.wheelCentralDiameter
      .map((diameterName) => mapNameToId(diameterName, backendFilters?.wheels?.central_diameter || backendFilters?.wheels?.wheels_central_diameter))
      .filter((id): id is number => id !== undefined);
    if (centralDiameterIds.length > 0) {
      params.wheel_central_diameter = centralDiameterIds;
    }
  }
  if (filters.wheelFixingPoints && filters.wheelFixingPoints.length > 0) {
    const fixingPointsIds = filters.wheelFixingPoints
      .map((pointsName) => mapNameToId(pointsName, backendFilters?.wheels?.fixing_points || backendFilters?.wheels?.wheels_fixing_points))
      .filter((id): id is number => id !== undefined);
    if (fixingPointsIds.length > 0) {
      params.wheel_fixing_points = fixingPointsIds;
    }
  }
  if (filters.wheelHeight && filters.wheelHeight.length > 0) {
    const heightIds = filters.wheelHeight
      .map((heightName) => mapNameToId(heightName, backendFilters?.wheels?.height || backendFilters?.wheels?.wheels_height))
      .filter((id): id is number => id !== undefined);
    if (heightIds.length > 0) {
      params.wheel_height = heightIds;
    }
  }
  if (filters.wheelSpacing && filters.wheelSpacing.length > 0) {
    const spacingIds = filters.wheelSpacing
      .map((spacingName) => mapNameToId(spacingName, backendFilters?.wheels?.spacing || backendFilters?.wheels?.wheels_spacing))
      .filter((id): id is number => id !== undefined);
    if (spacingIds.length > 0) {
      params.wheel_spacing = spacingIds;
    }
  }
  if (filters.wheelTreadDepth && filters.wheelTreadDepth.length > 0) {
    const treadDepthIds = filters.wheelTreadDepth
      .map((depthName) => mapNameToId(depthName, backendFilters?.wheels?.tread_depth || backendFilters?.wheels?.wheels_tread_depth))
      .filter((id): id is number => id !== undefined);
    if (treadDepthIds.length > 0) {
      params.wheel_tread_depth = treadDepthIds;
    }
  }
  if (filters.wheelWidth && filters.wheelWidth.length > 0) {
    const widthIds = filters.wheelWidth
      .map((widthName) => mapNameToId(widthName, backendFilters?.wheels?.width || backendFilters?.wheels?.wheels_width))
      .filter((id): id is number => id !== undefined);
    if (widthIds.length > 0) {
      params.wheel_width = widthIds;
    }
  }

  // Stale inventory
  if (filters.staleMonths !== undefined) {
    params.stale_months = filters.staleMonths;
  }

  // Warehouse
  if (filters.warehouse && filters.warehouse.length > 0) {
    params.warehouse = filters.warehouse;
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
  console.log("Parts API Response:", response.data);
  const result = {
    parts: response.data.data.map(transformApiPart),
    pagination: response.data.pagination,
  };
  console.log("Transformed Parts:", result);
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
export const getFilters = async (): Promise<CarFilters> => {
  const response = await authInstance.get<CarFilters>(
    apiEndpoints.getFilters()
  );
  console.log("=== Filters API Response ===");
  console.log("Full response:", response.data);
  console.log("Response keys:", Object.keys(response.data || {}));
  if (response.data.categories) {
    console.log("Categories:", response.data.categories);
    console.log("Categories count:", response.data.categories.length);
  }
  // Log all filter categories
  Object.entries(response.data || {}).forEach(([key, value]) => {
    if (key !== "categories" && key !== "wheels") {
      console.log(`Filter category "${key}":`, value);
    }
  });
  if (response.data.wheels) {
    console.log("Wheels filters:", response.data.wheels);
  }
  console.log("============================");
  return response.data;
};

