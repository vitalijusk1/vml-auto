// Car query parameters interface
export interface CarQueryParams {
  car_model_id?: number;
  car_color_id?: number;
  car_fuel_id?: number;
  car_body_type_id?: number;
  car_years?: string;
  per_page?: number;
  page?: number;
}

// Parts query parameters interface
export interface PartsQueryParams {
  per_page?: number;
  page?: number;
  // Search
  search?: string;
  // Status filters
  status?: number | number[]; // IDs
  // Car filters
  car_brand?: number | number[]; // IDs
  car_model?: number | number[]; // IDs
  car_year?: number | number[];
  year_min?: number;
  year_max?: number;
  // Part filters
  category?: number | number[]; // IDs
  part_type?: string | string[];
  quality?: number | number[]; // IDs
  position?: number | number[]; // IDs
  body_type?: number | number[]; // IDs
  // Price range
  price_min?: number;
  price_max?: number;
  // Wheel filters - all are IDs now
  wheel_drive?: number | number[]; // IDs
  wheel_side?: number | number[]; // IDs
  wheel_central_diameter?: number | number[]; // IDs
  wheel_fixing_points?: number | number[]; // IDs
  wheel_height?: number | number[]; // IDs
  wheel_spacing?: number | number[]; // IDs
  wheel_tread_depth?: number | number[]; // IDs
  wheel_width?: number | number[]; // IDs
  // Stale inventory
  stale_months?: number;
  // Warehouse
  warehouse?: string | string[];
}

// Helper function to build query string from parameters
// Builds query string manually to avoid URL encoding commas in comma-separated values
const buildQueryString = (params: Record<string, unknown>): string => {
  const queryParts: string[] = [];

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    // Encode the key
    const encodedKey = encodeURIComponent(key);

    // Handle arrays - join with commas for comma-separated values (don't encode commas)
    if (Array.isArray(value)) {
      if (value.length > 0) {
        const validValues = value
          .filter((item) => item !== undefined && item !== null && item !== "")
          .map((item) => String(item));
        if (validValues.length > 0) {
          // Join with commas and encode each value separately, but keep commas unencoded
          const commaSeparated = validValues
            .map((v) => encodeURIComponent(v))
            .join(",");
          queryParts.push(`${encodedKey}=${commaSeparated}`);
        }
      }
    } else {
      // Encode single values normally
      const encodedValue = encodeURIComponent(String(value));
      queryParts.push(`${encodedKey}=${encodedValue}`);
    }
  });

  return queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
};

// API Routes
export const apiEndpoints = {
  // Cars
  getCars: (queryParams?: CarQueryParams) => {
    const queryString = queryParams
      ? buildQueryString(queryParams as Record<string, unknown>)
      : "";
    return `/cars${queryString}`;
  },
  getCarById: (id: number) => `/cars/${id}`,
  createCar: () => `/cars`,
  updateCar: (id: number) => `/cars/${id}`,
  deleteCar: (id: number) => `/cars/${id}`,

  // Parts
  getParts: (queryParams?: PartsQueryParams) => {
    const queryString = queryParams
      ? buildQueryString(queryParams as Record<string, unknown>)
      : "";
    return `/parts${queryString}`;
  },
  getPartById: (id: string) => `/parts/${id}`,
  createPart: () => `/parts`,
  updatePart: (id: string) => `/parts/${id}`,
  deletePart: (id: string) => `/parts/${id}`,

  // Orders
  getOrders: () => `/orders`,
  getOrderById: (id: string) => `/orders/${id}`,
  createOrder: () => `/orders`,
  updateOrder: (id: string) => `/orders/${id}`,
  deleteOrder: (id: string) => `/orders/${id}`,

  // Returns
  getReturns: () => `/returns`,
  getReturnById: (id: string) => `/returns/${id}`,
  createReturn: () => `/returns`,
  updateReturn: (id: string) => `/returns/${id}`,
  deleteReturn: (id: string) => `/returns/${id}`,

  // Filters
  getFilters: () => `/filters`,
};
