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
}

// Helper function to build query string from parameters
const buildQueryString = (params: Record<string, unknown>): string => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, String(value));
    }
  });

  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : "";
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
