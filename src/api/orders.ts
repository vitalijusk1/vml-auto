import authInstance from "./axios";
import { Order, FilterState, OrderStatus } from "@/types";
import { apiEndpoints, OrdersQueryParams } from "./routes/routes";
import {
  mapBrandNameToId,
  mapModelNameToId,
  mapFuelTypeNameToId,
} from "@/utils/filterMappers";

/**
 * Convert FilterState to OrdersQueryParams for API requests
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

  // Car filters - convert names to IDs
  if (filters.carBrand && filters.carBrand.length > 0) {
    const brandIds = filters.carBrand
      .map((brandName) => mapBrandNameToId(brandName, backendFilters))
      .filter((id): id is number => id !== undefined);
    if (brandIds.length > 0) {
      params.car_brand = brandIds.length === 1 ? brandIds[0] : brandIds;
    }
  }

  if (filters.carModel && filters.carModel.length > 0) {
    const modelIds = filters.carModel
      .map((modelName) =>
        mapModelNameToId(modelName, backendFilters, filters.carBrand)
      )
      .filter((id): id is number => id !== undefined);
    if (modelIds.length > 0) {
      params.car_model = modelIds.length === 1 ? modelIds[0] : modelIds;
    }
  }

  // Year range
  if (filters.yearRange?.min !== undefined) {
    params.year_min = filters.yearRange.min;
  }
  if (filters.yearRange?.max !== undefined) {
    params.year_max = filters.yearRange.max;
  }

  // Fuel type
  if (filters.fuelType && filters.fuelType.length > 0) {
    const fuelIds = filters.fuelType
      .map((fuelTypeName) => mapFuelTypeNameToId(fuelTypeName, backendFilters))
      .filter((id): id is number => id !== undefined);
    if (fuelIds.length > 0) {
      params.fuel_id = fuelIds.length === 1 ? fuelIds[0] : fuelIds;
    }
  }

  // Engine capacity
  if (filters.engineCapacity && filters.engineCapacity.length > 0) {
    params.engine_volume =
      filters.engineCapacity.length === 1
        ? filters.engineCapacity[0]
        : filters.engineCapacity;
  }

  // Date range
  if (filters.dateRange?.from) {
    params.date_from = filters.dateRange.from.toISOString().split("T")[0];
  }
  if (filters.dateRange?.to) {
    params.date_to = filters.dateRange.to.toISOString().split("T")[0];
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
