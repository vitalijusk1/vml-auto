// Car query parameters interface
export interface CarQueryParams {
  car_model_id?: number | string;
  car_color_id?: number | string;
  car_fuel_id?: number | string;
  car_body_type_id?: number | string;
  car_years?: string;
  per_page?: number;
  page?: number;
}

// Parts query parameters interface
export interface StatisticsOverviewQueryParams {
  date_from?: string;
  date_to?: string;
  brand_id?: string | number | (string | number)[];
  model_id?: string | number | (string | number)[];
  car_id?: string | number | (string | number)[];
  category_id?: string | number | (string | number)[];
  quality?: string | number | (string | number)[];
  status?: string | number | (string | number)[];
  position?: string | number | (string | number)[];
}

// Parts query parameters interface
export interface PartsQueryParams {
  // Pagination
  per_page?: number;
  page?: number;

  // Search
  search?: string;

  // Sorting
  sort_by?:
    | "sold_most"
    | "sold_least"
    | "never_sold"
    | "price_asc"
    | "price_desc";

  // Filters - all accept comma-separated IDs
  brand_id?: string | (string | number)[];
  model_id?: string | (string | number)[];
  category_id?: string | (string | number)[];
  quality?: string | (string | number)[];
  status?: string | (string | number)[];
  position?: string | (string | number)[];
  rims_fixing_points_id?: string | (string | number)[];
  rims_spacing_id?: string | (string | number)[];
  rims_central_diameter_id?: string | (string | number)[];
  tires_width_id?: string | (string | number)[];
  tires_height_id?: string | (string | number)[];
  fuel_id?: string | (string | number)[];
  body_type_id?: string | (string | number)[];
  gearbox_type_id?: string | (string | number)[];
  wheel_drive_id?: string | (string | number)[];
  color_id?: string | (string | number)[];

  // Ranges
  engine_volume?: number;
  engine_volume_from?: number;
  engine_volume_to?: number;
  year_from?: number;
  year_to?: number;
  price_from?: number;
  price_to?: number;
  mileage_from?: number;
  mileage_to?: number;
  engine_power_from?: number;
  engine_power_to?: number;

  // Date ranges
  date_from?: string;
  date_to?: string;
  create_date_from?: string;
  create_date_to?: string;
}

// Orders query parameters interface
export interface OrdersQueryParams {
  per_page?: number;
  page?: number;
  // Search
  search?: string;
  // Status filters
  status?: string | (string | number)[];
  // Date range
  date_from?: string;
  date_to?: string;
  // Car filters
  brand_id?: string | (string | number)[];
  model_id?: string | (string | number)[];
  // Part filters
  category_id?: string | (string | number)[];
  quality?: string | (string | number)[];
  position?: string | (string | number)[];
  body_type_id?: string | (string | number)[];
  // Price range
  price_from?: number;
  price_to?: number;
  // Fuel and engine
  fuel_id?: string | (string | number)[];
  engine_volume?: number;
  engine_volume_from?: number;
  engine_volume_to?: number;
  // Year range
  year_from?: number;
  year_to?: number;
  // Mileage range
  mileage_from?: number;
  mileage_to?: number;
  // Engine power range
  engine_power_from?: number;
  engine_power_to?: number;
  // Wheel filters
  wheel_drive_id?: string | (string | number)[];
  rims_fixing_points_id?: string | (string | number)[];
  rims_spacing_id?: string | (string | number)[];
  rims_central_diameter_id?: string | (string | number)[];
  tires_width_id?: string | (string | number)[];
  tires_height_id?: string | (string | number)[];
  // Date ranges
  create_date_from?: string;
  create_date_to?: string;
}

// Returns query parameters interface
export interface ReturnsQueryParams {
  per_page?: number;
  page?: number;
  // Search
  search?: string;
  // Status filters
  status?: string | (string | number)[];
  // Date range
  date_from?: string;
  date_to?: string;
  // Car filters
  brand_id?: string | (string | number)[];
  model_id?: string | (string | number)[];
  // Part filters
  category_id?: string | (string | number)[];
  quality?: string | (string | number)[];
  position?: string | (string | number)[];
  body_type_id?: string | (string | number)[];
  // Price range
  price_from?: number;
  price_to?: number;
  // Fuel and engine
  fuel_id?: string | (string | number)[];
  engine_volume?: number;
  engine_volume_from?: number;
  engine_volume_to?: number;
  // Year range
  year_from?: number;
  year_to?: number;
  // Mileage range
  mileage_from?: number;
  mileage_to?: number;
  // Engine power range
  engine_power_from?: number;
  engine_power_to?: number;
  // Wheel filters
  wheel_drive_id?: string | (string | number)[];
  rims_fixing_points_id?: string | (string | number)[];
  rims_spacing_id?: string | (string | number)[];
  rims_central_diameter_id?: string | (string | number)[];
  tires_width_id?: string | (string | number)[];
  tires_height_id?: string | (string | number)[];
  // Date ranges
  create_date_from?: string;
  create_date_to?: string;
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
  getOrders: (queryParams?: OrdersQueryParams) => {
    const queryString = queryParams
      ? buildQueryString(queryParams as Record<string, unknown>)
      : "";
    return `/orders${queryString}`;
  },
  getOrderById: (id: string) => `/orders/${id}`,
  createOrder: () => `/orders`,
  updateOrder: (id: string) => `/orders/${id}`,
  deleteOrder: (id: string) => `/orders/${id}`,

  // Returns
  getReturns: (queryParams?: ReturnsQueryParams) => {
    const queryString = queryParams
      ? buildQueryString(queryParams as Record<string, unknown>)
      : "";
    return `/order-returns${queryString}`;
  },
  getReturnById: (id: string) => `/returns/${id}`,
  createReturn: () => `/returns`,
  updateReturn: (id: string) => `/returns/${id}`,
  deleteReturn: (id: string) => `/returns/${id}`,

  // Filters
  getFilters: () => `/filters`,

  // Preorder Analysis
  getPreorderAnalysis: (params: {
    brand_id?: string | number;
    model_id?: string | number;
    year?: number;
    fuel_id?: string | number;
    engine_volume?: string;
    engine_volume_min?: number;
    engine_volume_max?: number;
    date_from?: string;
    date_to?: string;
  }) => {
    const queryString = buildQueryString(params as Record<string, unknown>);
    return `/preorder/analysis${queryString}`;
  },
  getStatisticsOverview: (queryParams?: StatisticsOverviewQueryParams) => {
    const queryString = queryParams
      ? buildQueryString(queryParams as Record<string, unknown>)
      : "";
    return `/statistics/overview${queryString}`;
  },
  getStatisticsParts: (queryParams?: StatisticsOverviewQueryParams) => {
    const queryString = queryParams
      ? buildQueryString(queryParams as Record<string, unknown>)
      : "";
    return `/statistics/parts${queryString}`;
  },
  getStatisticsOrders: (
    queryParams?: StatisticsOverviewQueryParams & { group_by?: string }
  ) => {
    const queryString = queryParams
      ? buildQueryString(queryParams as Record<string, unknown>)
      : "";
    return `/statistics/orders${queryString}`;
  },
};
