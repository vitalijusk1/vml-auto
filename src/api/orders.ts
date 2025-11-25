import authInstance from "./axios";
import { Order, FilterState, OrderStatus } from "@/types";
import { apiEndpoints, OrdersQueryParams } from "./routes/routes";
import { buildOrdersQueryParams } from "@/utils/queryParamsBuilder";

/**
 * Convert FilterState to OrdersQueryParams for API requests
 * Supports all the same filters as parts API
 */
export const filterStateToOrdersQueryParams = (
  filters: FilterState,
  pagination?: { page?: number; per_page?: number },
  backendFilters?: any
): OrdersQueryParams => {
  return buildOrdersQueryParams(filters, pagination, backendFilters);
};

// Map API order_status to OrderStatus enum - now just returns raw status
const mapOrderStatus = (status: string): OrderStatus => {
  const validStatuses: OrderStatus[] = [
    "NEW",
    "PREPARED",
    "SENT",
    "DELIVERED",
    "CANCELLED",
  ];
  return (
    validStatuses.includes(status as OrderStatus) ? status : "NEW"
  ) as OrderStatus;
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
          engineCapacity: carData.engine_volume
            ? parseInt(carData.engine_volume)
            : carData.car_engine_cubic_capacity
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
