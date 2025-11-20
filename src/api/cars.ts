import authInstance from "./axios";
import { Car } from "@/types";
import { apiEndpoints, CarQueryParams } from "./routes/routes";
import { BackendFilters } from "@/utils/backendFilters";
import { getLocalizedText } from "@/utils/i18n";

// API Response types
interface ApiCarResponse {
  id: number;
  rrr_id: number;
  car_body_number: string;
  car_engine_number: string;
  car_years: string;
  car_model_years: string;
  car_engine_cubic_capacity: string;
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
      last_synced_at: string;
      created_at: string;
      updated_at: string;
    };
  };
  car_color: {
    id: number;
    rrr_id: string;
    name: string;
    languages: Record<string, string>;
  } | null;
  car_fuel: {
    id: number;
    rrr_id: string;
    name: string;
    languages: Record<string, string>;
  } | null;
  car_body_type: {
    id: number;
    rrr_id: string;
    name: string;
    languages: Record<string, string>;
  } | null;
  wheel_type: {
    id: number;
    rrr_id: string;
    name: string;
    languages: Record<string, string>;
  } | null;
  wheel_drive: {
    id: number;
    rrr_id: string;
    name: string;
    languages: Record<string, string>;
  } | null;
  gearbox_type: {
    id: number;
    rrr_id: string;
    name: string;
    languages: Record<string, string>;
  } | null;
  category: {
    id: number;
    rrr_id: string;
    name: string;
    languages: Record<string, string> | string;
  } | null;
}

interface ApiCarsResponse {
  success: boolean;
  data: ApiCarResponse[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

// Transform API response to Car type
function transformApiCar(apiCar: ApiCarResponse): Car {
  return {
    id: apiCar.id,
    photo: apiCar.photo,
    photo_gallery: apiCar.car_photo_gallery || [],
    brand: {
      id: apiCar.car_model.brand.id,
      name: apiCar.car_model.brand.name,
    },
    model: {
      id: apiCar.car_model.id,
      name: apiCar.car_model.name,
    },
    year: parseInt(apiCar.car_years) || 0,
    model_year: apiCar.car_model_years
      ? parseInt(apiCar.car_model_years)
      : null,
    engine: {
      code: apiCar.car_engine_code,
      capacity: parseInt(apiCar.car_engine_cubic_capacity) || 0,
      power: apiCar.car_engine_power ? parseInt(apiCar.car_engine_power) : null,
    },
    fuel: apiCar.car_fuel
      ? {
          id: apiCar.car_fuel.id,
          name: getLocalizedText(apiCar.car_fuel.languages, apiCar.car_fuel.name),
        }
      : null,
    body_type: apiCar.car_body_type
      ? {
          id: apiCar.car_body_type.id,
          name: getLocalizedText(apiCar.car_body_type.languages, apiCar.car_body_type.name),
        }
      : null,
    wheel_drive: apiCar.wheel_drive
      ? {
          id: apiCar.wheel_drive.id,
          name: getLocalizedText(apiCar.wheel_drive.languages, apiCar.wheel_drive.name),
        }
      : null,
    wheel_type: apiCar.wheel_type
      ? {
          id: apiCar.wheel_type.id,
          name: getLocalizedText(apiCar.wheel_type.languages, apiCar.wheel_type.name),
        }
      : null,
    gearbox_type: apiCar.gearbox_type
      ? {
          id: apiCar.gearbox_type.id,
          name: getLocalizedText(apiCar.gearbox_type.languages, apiCar.gearbox_type.name),
        }
      : null,
    color: apiCar.car_color
      ? {
          id: apiCar.car_color.id,
          name: getLocalizedText(apiCar.car_color.languages, apiCar.car_color.name),
        }
      : null,
    color_code: apiCar.car_color_code,
    interior: apiCar.car_interior || "",
    category: apiCar.category
      ? {
          id: apiCar.category.id,
          name: getLocalizedText(apiCar.category.languages, apiCar.category.name),
        }
      : null,
    mileage: apiCar.car_mileage ? parseInt(apiCar.car_mileage) : null,
    defectation_notes: apiCar.defectation_notes || "",
    last_synced_at: apiCar.last_synced_at,
  };
}

// Get all cars with pagination
export interface CarsResponse {
  cars: Car[];
  pagination: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export const getCars = async (
  queryParams?: CarQueryParams
): Promise<CarsResponse> => {
  const response = await authInstance.get<ApiCarsResponse>(
    apiEndpoints.getCars(queryParams)
  );
  const result = {
    cars: response.data.data.map(transformApiCar),
    pagination: response.data.pagination,
  };
  return result;
};

// Get a single car by ID
export const getCar = async (id: number): Promise<Car> => {
  const response = await authInstance.get<{
    success: boolean;
    data: ApiCarResponse;
  }>(apiEndpoints.getCarById(id));
  return transformApiCar(response.data.data);
};

// Get filters for cars (same endpoint returns all filters: car, parts, wheels, categories)
export const getFilters = async (): Promise<BackendFilters> => {
  const response = await authInstance.get<BackendFilters>(
    apiEndpoints.getFilters()
  );
  return response.data;
};

// Create a new car
export const createCar = async (car: Omit<Car, "id">): Promise<Car> => {
  const response = await authInstance.post(apiEndpoints.createCar(), car);
  return response.data;
};

// Update a car
export const updateCar = async (
  id: number,
  car: Partial<Car>
): Promise<Car> => {
  const response = await authInstance.put(apiEndpoints.updateCar(id), car);
  return response.data;
};

// Delete a car
export const deleteCar = async (id: number): Promise<void> => {
  await authInstance.delete(apiEndpoints.deleteCar(id));
};
