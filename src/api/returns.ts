import authInstance from "./axios";
import { Return, ReturnStatus, Customer, FilterState } from "@/types";
import { apiEndpoints, ReturnsQueryParams } from "./routes/routes";
import {
  mapBrandNameToId,
  mapModelNameToId,
  mapFuelTypeNameToId,
  mapBodyTypeNameToId,
  mapStatusNameToId,
  mapPositionNameToId,
  mapQualityNameToId,
  mapCategoryNamesToIds,
  mapNameToId,
} from "@/utils/filterMappers";

// API response types
interface ApiReturnResponse {
  id: number;
  return_id: number;
  order_id: number | null;
  order_nr: string | null;
  client_name: string;
  client_email: string | null;
  client_phone: string | null;
  return_date: string;
  return_status: string;
  refund_status?: string;
  return_reason: string;
  return_amount: string;
  currency: string;
  seller_currency: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_address: string;
  customer_postal_code: string;
  customer_country: string;
  customer_region: string | null;
  items: Array<{
    id: number;
    order_id: number;
    part_id: number | null;
    name: string;
    return_reason: string;
    price: number;
    returnable_amount: number;
    currency: string;
    price_in_seller_currency: number;
    vat_rate: number;
    part_details?: {
      id?: number;
      part_id?: number;
      name?: string;
      manufacturer_code?: string;
      visible_code?: string;
      other_code?: string;
      quality?: number;
      status?: number;
      position?: number;
      price?: string;
      original_price?: string;
      currency?: string;
      original_currency?: string;
      notes?: string;
      sticker_note?: string;
      photo?: string;
      part_photo_gallery?: string[];
      shop_url?: string;
      show_url?: string | null;
      date?: string;
      car?: {
        id?: number;
        brand?: string;
        brand_id?: number | null;
        model?: string;
        model_id?: number;
        year?: string;
        vin?: string;
        body_type?: string | null;
        body_type_id?: number | null;
        fuel?: string | null;
        fuel_id?: number | null;
        engine_volume?: string | null;
        engine_power?: string | null;
        engine_type?: string;
        engine_code?: string | null;
        gearbox_type?: string | null;
        gearbox_code?: string;
        color_code?: string | null;
        mileage?: string | null;
      };
    };
  }>;
  refund_invoice_url: string | null;
  refund_invoice_number: string | null;
  total_returnable_amount: string;
  total_returnable_amount_in_seller_currency: string;
}

interface ApiReturnsResponse {
  success: boolean;
  data: ApiReturnResponse[];
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
}

// Map API return status to ReturnStatus type
const mapReturnStatus = (status: string): ReturnStatus => {
  const statusLower = status.toLowerCase();
  if (statusLower.includes("returned") || statusLower.includes("refunded") || statusLower === "paid_out") {
    return "Refunded";
  }
  if (statusLower.includes("approved")) {
    return "Approved";
  }
  if (statusLower.includes("rejected")) {
    return "Rejected";
  }
  return "Requested";
};

// Transform API return data to Return type
const transformReturn = (apiReturn: ApiReturnResponse): Return => {
  // Determine if customer is a company (check if last name contains company indicators)
  const fullName = `${apiReturn.customer_first_name} ${apiReturn.customer_last_name}`.trim();
  const isCompany = 
    apiReturn.customer_last_name.includes("SLU") ||
    apiReturn.customer_last_name.includes("Oy") ||
    apiReturn.customer_last_name.includes("Ltd") ||
    apiReturn.customer_last_name.includes("Inc") ||
    apiReturn.customer_last_name.includes("GmbH") ||
    apiReturn.customer_last_name.includes("SRL") ||
    apiReturn.customer_last_name.includes("S.A.") ||
    apiReturn.customer_last_name.includes("S.A") ||
    apiReturn.customer_last_name.includes("SAS") ||
    apiReturn.customer_last_name.includes("SARL");

  const customer: Customer = {
    id: String(apiReturn.return_id), // Use return_id as customer ID fallback
    name: apiReturn.client_name || fullName,
    email: apiReturn.client_email || "",
    phone: apiReturn.client_phone || undefined,
    country: apiReturn.customer_country || "",
    city: apiReturn.customer_region || undefined,
    address: apiReturn.customer_address || undefined,
    isCompany: isCompany,
    companyName: isCompany ? apiReturn.customer_last_name : undefined,
  };

  // Parse amounts - API provides amounts as strings in seller_currency
  const returnAmount = parseFloat(apiReturn.total_returnable_amount || "0") || 0;
  
  // Use seller_currency to determine EUR/PLN amounts
  // API only provides amounts in seller_currency, so we set the other to 0
  const isEUR = apiReturn.seller_currency === "EUR";
  const refundableAmountEUR = isEUR ? returnAmount : 0;
  const refundableAmountPLN = isEUR ? 0 : returnAmount;

  // Get order_id and id from first item if available
  const firstItem = apiReturn.items && apiReturn.items.length > 0 ? apiReturn.items[0] : null;
  const itemOrderId = firstItem?.order_id ? String(firstItem.order_id) : undefined;
  const itemId = firstItem?.id ? String(firstItem.id) : undefined;

  return {
    id: String(apiReturn.return_id),
    orderId: apiReturn.order_id ? String(apiReturn.order_id) : String(apiReturn.return_id),
    itemOrderId: itemOrderId,
    itemId: itemId,
    dateCreated: new Date(apiReturn.return_date),
    customerId: String(apiReturn.return_id),
    customer: customer,
    items: apiReturn.items.map((item) => {
      // API provides price in item currency and price_in_seller_currency
      // If item currency matches seller currency, use price directly
      // Otherwise, use price_in_seller_currency for conversion
      const isItemEUR = item.currency === "EUR";
      let priceEUR = 0;
      let pricePLN = 0;
      
      if (isEUR) {
        // Seller currency is EUR
        priceEUR = isItemEUR ? item.price : (item.price_in_seller_currency || 0);
        pricePLN = 0; // No PLN amount provided
      } else {
        // Seller currency is PLN (or other)
        priceEUR = 0; // No EUR amount provided
        pricePLN = !isItemEUR ? item.price : (item.price_in_seller_currency || 0);
      }
      
      // Extract part details from part_details if available
      const partDetails = item.part_details;
      const carData = partDetails?.car;
      
      // Map status number to string (0=In Stock, 2=Reserved, 4=Sold, etc.)
      const statusMap: Record<number, string> = {
        0: "In Stock",
        2: "Reserved",
        4: "Sold",
      };
      const partStatus = partDetails?.status !== undefined 
        ? statusMap[partDetails.status] || `Status ${partDetails.status}`
        : undefined;
      
      // Use manufacturer_code, visible_code, or other_code as part code
      const partCode = partDetails?.manufacturer_code || 
                      partDetails?.visible_code || 
                      partDetails?.other_code;
      
      // Parse price from string
      const partPriceEUR = partDetails?.price 
        ? parseFloat(partDetails.price) 
        : undefined;
      
      return {
        partId: item.part_id ? String(item.part_id) : "",
        partName: item.name || "",
        quantity: 1, // API doesn't provide quantity in items, default to 1
        reason: item.return_reason || "",
        price: item.price || 0,
        priceEUR: priceEUR,
        pricePLN: pricePLN,
        // Part details from part_details
        partCode: partCode,
        partCategory: undefined, // Not available in API response
        partStatus: partStatus,
        partWarehouse: undefined, // Not available in API response
        partPriceEUR: partPriceEUR,
        photo: partDetails?.photo,
        photoGallery: partDetails?.part_photo_gallery 
          ? [
              ...(partDetails.photo ? [partDetails.photo] : []),
              ...partDetails.part_photo_gallery.filter((p): p is string => !!p)
            ]
          : partDetails?.photo 
            ? [partDetails.photo] 
            : undefined,
        manufacturerCode: partDetails?.manufacturer_code,
        // Car details from part_details.car
        carBrand: carData?.brand,
        carModel: carData?.model,
        carYear: carData?.year ? parseInt(carData.year) : undefined,
        carBodyType: carData?.body_type || undefined,
        carFuelType: carData?.fuel || undefined,
        carEngineCapacity: carData?.engine_volume 
          ? parseFloat(carData.engine_volume) 
          : undefined,
      };
    }),
    refundableAmountEUR: refundableAmountEUR,
    refundableAmountPLN: refundableAmountPLN,
    returnAmount: returnAmount,
    status: mapReturnStatus(apiReturn.return_status),
    returnStatus: apiReturn.return_status,
    refundStatus: apiReturn.refund_status,
    creditNoteUrl: apiReturn.refund_invoice_url || undefined,
  };
};

// Helper function to get wheels array from backend filters
const getWheelsArray = (
  primary?: (string | any)[],
  fallback?: (string | any)[]
): (string | any)[] | undefined => {
  if (Array.isArray(primary) && primary.length > 0) {
    return primary;
  }
  if (Array.isArray(fallback) && fallback.length > 0) {
    return fallback;
  }
  return undefined;
};

/**
 * Convert FilterState to ReturnsQueryParams for API requests
 * Supports all the same filters as parts API
 */
export const filterStateToReturnsQueryParams = (
  filters: FilterState,
  backendFilters?: any
): ReturnsQueryParams => {
  const params: ReturnsQueryParams = {};

  // Search
  if (filters.search && filters.search.trim()) {
    params.search = filters.search.trim();
  }

  // Status - convert "All" to undefined, otherwise convert names to IDs
  if (
    filters.status !== "All" &&
    Array.isArray(filters.status) &&
    filters.status.length > 0
  ) {
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
  // Only pass parent IDs when parent is selected with all children
  if (filters.partCategory && filters.partCategory.length > 0) {
    const categoryIds = mapCategoryNamesToIds(
      filters.partCategory,
      backendFilters
    );
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

  // Fuel type
  if (filters.fuelType && filters.fuelType.length > 0) {
    const fuelIds = filters.fuelType
      .map((fuelTypeName) => mapFuelTypeNameToId(fuelTypeName, backendFilters))
      .filter((id): id is number => id !== undefined);
    if (fuelIds.length > 0) {
      params.fuel_id = fuelIds;
    }
  }

  // Engine capacity range
  if (filters.engineCapacityRange?.min !== undefined) {
    params.engine_volume_min = filters.engineCapacityRange.min;
  }
  if (filters.engineCapacityRange?.max !== undefined) {
    params.engine_volume_max = filters.engineCapacityRange.max;
  }

  // Wheel filters - convert names to IDs
  const wheels = backendFilters?.wheels;
  if (filters.wheelSide && filters.wheelSide.length > 0) {
    const filterArray = getWheelsArray(wheels?.wheels);
    const sideIds = filters.wheelSide
      .map((sideName) => mapNameToId(sideName, filterArray))
      .filter((id): id is number => id !== undefined);
    if (sideIds.length > 0) {
      params.wheel_side = sideIds;
    }
  }
  if (filters.wheelDrive && filters.wheelDrive.length > 0) {
    const filterArray = getWheelsArray(wheels?.drives, wheels?.wheel_drives);
    const driveIds = filters.wheelDrive
      .map((driveName) => mapNameToId(driveName, filterArray))
      .filter((id): id is number => id !== undefined);
    if (driveIds.length > 0) {
      params.wheel_drive = driveIds;
    }
  }
  if (filters.wheelFixingPoints && filters.wheelFixingPoints.length > 0) {
    const filterArray = getWheelsArray(
      wheels?.fixing_points,
      wheels?.wheels_fixing_points
    );
    const fixingPointsIds = filters.wheelFixingPoints
      .map((pointName) => mapNameToId(String(pointName), filterArray))
      .filter((id): id is number => id !== undefined);
    if (fixingPointsIds.length > 0) {
      params.wheel_fixing_points = fixingPointsIds;
    }
  }
  if (filters.wheelSpacing && filters.wheelSpacing.length > 0) {
    const filterArray = getWheelsArray(wheels?.spacing, wheels?.wheels_spacing);
    const spacingIds = filters.wheelSpacing
      .map((spacingName) => mapNameToId(String(spacingName), filterArray))
      .filter((id): id is number => id !== undefined);
    if (spacingIds.length > 0) {
      params.wheel_spacing = spacingIds;
    }
  }
  if (filters.wheelCentralDiameter && filters.wheelCentralDiameter.length > 0) {
    const filterArray = getWheelsArray(
      wheels?.central_diameter,
      wheels?.wheels_central_diameter
    );
    const diameterIds = filters.wheelCentralDiameter
      .map((diameterName) => mapNameToId(String(diameterName), filterArray))
      .filter((id): id is number => id !== undefined);
    if (diameterIds.length > 0) {
      params.wheel_central_diameter = diameterIds;
    }
  }
  if (filters.wheelHeight && filters.wheelHeight.length > 0) {
    const filterArray = getWheelsArray(wheels?.height, wheels?.wheels_height);
    const heightIds = filters.wheelHeight
      .map((heightName) => mapNameToId(String(heightName), filterArray))
      .filter((id): id is number => id !== undefined);
    if (heightIds.length > 0) {
      params.wheel_height = heightIds;
    }
  }
  if (filters.wheelTreadDepth && filters.wheelTreadDepth.length > 0) {
    const filterArray = getWheelsArray(
      wheels?.tread_depth,
      wheels?.wheels_tread_depth
    );
    const treadDepthIds = filters.wheelTreadDepth
      .map((depthName) => mapNameToId(String(depthName), filterArray))
      .filter((id): id is number => id !== undefined);
    if (treadDepthIds.length > 0) {
      params.wheel_tread_depth = treadDepthIds;
    }
  }
  if (filters.wheelWidth && filters.wheelWidth.length > 0) {
    const filterArray = getWheelsArray(wheels?.width, wheels?.wheels_width);
    const widthIds = filters.wheelWidth
      .map((widthName) => mapNameToId(String(widthName), filterArray))
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

// Get all returns
export const getReturns = async (
  queryParams?: ReturnsQueryParams
): Promise<Return[]> => {
  const response = await authInstance.get<ApiReturnsResponse>(
    apiEndpoints.getReturns(queryParams)
  );
  
  // Handle response structure: { success: true, data: [...] }
  if (response.data && response.data.success && Array.isArray(response.data.data)) {
    return response.data.data.map(transformReturn);
  }
  
  // Fallback: if data is directly an array
  if (Array.isArray(response.data)) {
    return response.data.map(transformReturn);
  }
  
  // Fallback: if data.data exists
  if (response.data && Array.isArray((response.data as any).data)) {
    return (response.data as any).data.map(transformReturn);
  }
  
  console.warn("Unexpected returns API response structure:", response.data);
  return [];
};

// Get a single return by ID
export const getReturn = async (id: string): Promise<Return> => {
  const response = await authInstance.get(apiEndpoints.getReturnById(id));
  return response.data;
};

// Create a new return
export const createReturn = async (
  returnItem: Omit<Return, "id">
): Promise<Return> => {
  const response = await authInstance.post(apiEndpoints.createReturn(), returnItem);
  return response.data;
};

// Update a return
export const updateReturn = async (
  id: string,
  returnItem: Partial<Return>
): Promise<Return> => {
  const response = await authInstance.put(apiEndpoints.updateReturn(id), returnItem);
  return response.data;
};

// Delete a return
export const deleteReturn = async (id: string): Promise<void> => {
  await authInstance.delete(apiEndpoints.deleteReturn(id));
};

