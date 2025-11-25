import authInstance from "./axios";
import { Return, Customer, FilterState } from "@/types";
import { apiEndpoints, ReturnsQueryParams } from "./routes/routes";
import { buildReturnsQueryParams } from "@/utils/queryParamsBuilder";
import { mapReturnStatus } from "@/utils/statusTranslation";

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

// Use imported mapReturnStatus from statusTranslation.ts

// Transform API return data to Return type
const transformReturn = (apiReturn: ApiReturnResponse): Return => {
  // Determine if customer is a company (check if last name contains company indicators)
  const fullName =
    `${apiReturn.customer_first_name} ${apiReturn.customer_last_name}`.trim();
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
  const returnAmount =
    parseFloat(apiReturn.total_returnable_amount || "0") || 0;

  // Use seller_currency to determine EUR/PLN amounts
  // API only provides amounts in seller_currency, so we set the other to 0
  const isEUR = apiReturn.seller_currency === "EUR";
  const refundableAmountEUR = isEUR ? returnAmount : 0;
  const refundableAmountPLN = isEUR ? 0 : returnAmount;

  // Get order_id and id from first item if available
  const firstItem =
    apiReturn.items && apiReturn.items.length > 0 ? apiReturn.items[0] : null;
  const itemOrderId = firstItem?.order_id
    ? String(firstItem.order_id)
    : undefined;
  const itemId = firstItem?.id ? String(firstItem.id) : undefined;

  return {
    id: String(apiReturn.return_id),
    orderId: apiReturn.order_id
      ? String(apiReturn.order_id)
      : String(apiReturn.return_id),
    itemOrderId: itemOrderId,
    itemId: itemId,
    dateCreated: new Date(apiReturn.return_date).toISOString(),
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
        priceEUR = isItemEUR ? item.price : item.price_in_seller_currency || 0;
        pricePLN = 0; // No PLN amount provided
      } else {
        // Seller currency is PLN (or other)
        priceEUR = 0; // No EUR amount provided
        pricePLN = !isItemEUR ? item.price : item.price_in_seller_currency || 0;
      }

      // Extract part details from part_details if available
      const partDetails = item.part_details;
      const carData = partDetails?.car;

      // Part status - just store the numeric ID, display logic is in frontend
      // The actual status name should come from backend filters if available
      const partStatus =
        partDetails?.status !== undefined
          ? String(partDetails.status)
          : undefined;

      // Use manufacturer_code, visible_code, or other_code as part code
      const partCode =
        partDetails?.manufacturer_code ||
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
              ...partDetails.part_photo_gallery.filter((p): p is string => !!p),
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

/**
 * Convert FilterState to ReturnsQueryParams for API requests
 * Supports all the same filters as parts API
 */
export const filterStateToReturnsQueryParams = (
  filters: FilterState,
  pagination?: { page?: number; per_page?: number },
  backendFilters?: any
): ReturnsQueryParams => {
  return buildReturnsQueryParams(filters, pagination, backendFilters);
};

export interface ReturnsResponse {
  returns: Return[];
  pagination?: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

// Get all returns
export const getReturns = async (
  queryParams?: ReturnsQueryParams
): Promise<ReturnsResponse> => {
  const response = await authInstance.get<ApiReturnsResponse>(
    apiEndpoints.getReturns(queryParams)
  );

  // Default pagination for responses without pagination
  const defaultPagination = {
    total: 0,
    per_page: 15,
    current_page: 1,
    last_page: 1,
  };

  // Handle response structure: { success: true, data: [...], meta: {...} }
  if (
    response.data &&
    response.data.success &&
    Array.isArray(response.data.data)
  ) {
    const returns = response.data.data.map(transformReturn);
    const pagination = response.data.meta
      ? {
          total: response.data.meta.total,
          per_page: response.data.meta.per_page,
          current_page: response.data.meta.current_page,
          last_page: response.data.meta.last_page,
        }
      : { ...defaultPagination, total: returns.length };
    return { returns, pagination };
  }

  // Fallback: if data is directly an array
  if (Array.isArray(response.data)) {
    const returns = response.data.map(transformReturn);
    return {
      returns,
      pagination: { ...defaultPagination, total: returns.length },
    };
  }

  // Fallback: if data.data exists
  if (response.data && Array.isArray((response.data as any).data)) {
    const returns = (response.data as any).data.map(transformReturn);
    return {
      returns,
      pagination: { ...defaultPagination, total: returns.length },
    };
  }

  console.warn("Unexpected returns API response structure:", response.data);
  return { returns: [], pagination: defaultPagination };
};
