import authInstance from "./axios";
import { Order, FilterState, OrderStatus } from "@/types";
import { apiEndpoints, OrdersQueryParams } from "./routes/routes";
import { extractCategoryIds } from "@/utils/filterHelpers";

/**
 * Convert FilterState to OrdersQueryParams for API requests
 * Supports all the same filters as parts API
 */
export const filterStateToOrdersQueryParams = (
  filters: FilterState,
  backendFilters?: any
): OrdersQueryParams => {
  const params: OrdersQueryParams = {};

  // Search
  if (filters.search && filters.search.trim()) {
    params.search = filters.search.trim();
  }

  // Status filters (orders use string status, not IDs)
  if (filters.status && filters.status !== "All") {
    if (Array.isArray(filters.status)) {
      params.status = filters.status;
    } else {
      params.status = [filters.status];
    }
  }

  // Date range
  if (filters.dateRange?.from) {
    params.date_from = filters.dateRange.from.toISOString().split("T")[0];
  }
  if (filters.dateRange?.to) {
    params.date_to = filters.dateRange.to.toISOString().split("T")[0];
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

  // Fuel type - extract IDs directly from FilterOption objects
  if (filters.fuelType && filters.fuelType.length > 0) {
    const fuelIds = filters.fuelType.map((fuel) => fuel.id);
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

  // Wheel filters - extract IDs directly from FilterOption objects
  if (filters.wheelSide && filters.wheelSide.length > 0) {
    const sideIds = filters.wheelSide.map((side) => side.id);
    if (sideIds.length > 0) {
      params.wheel_side = sideIds;
    }
  }

  if (filters.wheelDrive && filters.wheelDrive.length > 0) {
    const driveIds = filters.wheelDrive.map((drive) => drive.id);
    if (driveIds.length > 0) {
      params.wheel_drive = driveIds;
    }
  }

  // Wheel filters - extract IDs directly from FilterOption objects
  if (filters.wheelFixingPoints && filters.wheelFixingPoints.length > 0) {
    const fixingPointsIds = filters.wheelFixingPoints.map(
      (points) => points.id
    );
    if (fixingPointsIds.length > 0) {
      params.wheel_fixing_points = fixingPointsIds;
    }
  }

  if (filters.wheelSpacing && filters.wheelSpacing.length > 0) {
    const spacingIds = filters.wheelSpacing.map((spacing) => spacing.id);
    if (spacingIds.length > 0) {
      params.wheel_spacing = spacingIds;
    }
  }

  if (filters.wheelCentralDiameter && filters.wheelCentralDiameter.length > 0) {
    const diameterIds = filters.wheelCentralDiameter.map(
      (diameter) => diameter.id
    );
    if (diameterIds.length > 0) {
      params.wheel_central_diameter = diameterIds;
    }
  }

  if (filters.wheelHeight && filters.wheelHeight.length > 0) {
    const heightIds = filters.wheelHeight.map((height) => height.id);
    if (heightIds.length > 0) {
      params.wheel_height = heightIds;
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

// Map API order_status to OrderStatus enum
const mapOrderStatus = (status: string): OrderStatus => {
  const statusMap: Record<string, OrderStatus> = {
    NEW: "Pending",
    PREPARED: "Processing",
    SENT: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };
  return statusMap[status] || "Pending";
};

// Parse VIES VAT check result if available
const parseViesResult = (
  viesResult: string | null
): {
  isCompany: boolean;
  viesValidated?: boolean;
} => {
  if (!viesResult) return { isCompany: false };
  try {
    const parsed = JSON.parse(viesResult);
    return {
      isCompany: parsed.status === "valid",
      viesValidated: parsed.status === "valid",
    };
  } catch {
    return { isCompany: false };
  }
};

// Transform API order data - map API response structure to Order type
// Keep dates as strings for Redux serialization
const transformOrder = (order: any): any => {
  const viesResult = parseViesResult(order.vies_vat_check_result);
  const isCompany = !!order.company_code || viesResult.isCompany;

  return {
    id: order.order_id || String(order.id),
    date: order.order_date || new Date().toISOString(),
    customerId: String(order.id || ""),
    customer: {
      id: String(order.id || ""),
      name: order.client_name || "Unknown",
      email: order.client_email || "",
      phone: order.client_phone || "",
      country: order.client_address_country || "",
      city: order.client_address_city || "",
      address: order.client_address || "",
      isCompany: isCompany,
      companyName: order.company_code || undefined,
      vatNumber: order.company_vat_code || undefined,
      viesValidated: viesResult.viesValidated,
    },
    items: (order.items || []).map((item: any) => {
      // Extract car data from part_details.car if available
      const carData = item.part_details?.car;
      const partDetails = item.part_details;

      // Extract photo and photo gallery
      const photo = partDetails?.photo || item.photo;
      const photoGallery = partDetails?.part_photo_gallery
        ? [
            ...(partDetails.photo ? [partDetails.photo] : []),
            ...((
              partDetails.part_photo_gallery as string[] | undefined
            )?.filter((p: string) => !!p) ?? []),
          ]
        : partDetails?.photo
        ? [partDetails.photo]
        : undefined;

      return {
        partId: item.item_id || String(item.id || ""),
        partName: item.name || "",
        quantity: item.quantity ?? 1, // Default to 1 if not provided
        priceEUR: parseFloat(item.price || item.sell_price || "0") || 0,
        pricePLN: 0, // Not provided in API response
        photo: photo,
        photoGallery: photoGallery,
        carId: item.car_id || carData?.id || undefined,
        manufacturerCode:
          item.manufacturer_code || partDetails?.manufacturer_code || undefined,
        // Car details from part_details.car
        ...(carData && {
          carBrand:
            carData.brand || carData.car_model?.brand?.name || undefined,
          carModel: carData.model || carData.car_model?.name || undefined,
          carYear: carData.year
            ? typeof carData.year === "string"
              ? parseInt(carData.year)
              : carData.year
            : carData.car_years
            ? parseInt(carData.car_years)
            : undefined,
          bodyType:
            carData.body_type || carData.car_body_type?.name || undefined,
          engineCapacity:
            carData.engine_capacity || carData.car_engine_cubic_capacity
              ? parseInt(carData.car_engine_cubic_capacity)
              : undefined,
          fuelType: carData.fuel || carData.car_fuel?.name || undefined,
        }),
      };
    }),
    totalAmountEUR: parseFloat(order.total_price || "0") || 0,
    totalAmountPLN: 0, // Not provided in API response, would need conversion
    shippingCostEUR: parseFloat(order.shipping_price || "0") || 0,
    shippingCostPLN: 0, // Not provided in API response, would need conversion
    status: mapOrderStatus(order.order_status || "NEW"),
    paymentMethod: order.payment_method || "",
    shippingStatus: mapOrderStatus(order.order_status || "NEW"), // Map to same status enum
    invoiceUrl: order.invoice_download_url || undefined,
  };
};

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

// Get all orders
export const getOrders = async (
  queryParams?: OrdersQueryParams
): Promise<OrdersResponse> => {
  const url = apiEndpoints.getOrders(queryParams);
  console.log("Orders API URL:", url);
  const response = await authInstance.get(url);
  // Handle different response structures
  const data = response.data;
  let orders: any[] = [];
  let pagination = {
    total: 0,
    per_page: 15,
    current_page: 1,
    last_page: 1,
  };

  // Extract orders array and pagination from response
  if (Array.isArray(data)) {
    orders = data;
  } else if (data && Array.isArray(data.data)) {
    orders = data.data;
    if (data.pagination) {
      pagination = data.pagination;
    }
  } else if (data && data.success && Array.isArray(data.data)) {
    orders = data.data;
    if (data.pagination) {
      pagination = data.pagination;
    }
  } else {
    console.warn("Unexpected orders API response structure:", data);
    return { orders: [], pagination };
  }

  // Transform orders (keep dates as strings for Redux)
  return {
    orders: orders.map(transformOrder) as Order[],
    pagination,
  };
};

// Get a single order by ID
export const getOrder = async (id: string): Promise<Order> => {
  const response = await authInstance.get(apiEndpoints.getOrderById(id));
  return response.data;
};

// Create a new order
export const createOrder = async (order: Omit<Order, "id">): Promise<Order> => {
  const response = await authInstance.post(apiEndpoints.createOrder(), order);
  return response.data;
};

// Update an order
export const updateOrder = async (
  id: string,
  order: Partial<Order>
): Promise<Order> => {
  const response = await authInstance.put(apiEndpoints.updateOrder(id), order);
  return response.data;
};

// Delete an order
export const deleteOrder = async (id: string): Promise<void> => {
  await authInstance.delete(apiEndpoints.deleteOrder(id));
};
