import authInstance from "./axios";
import { Car } from "@/types";
import { apiEndpoints, CarQueryParams } from "./routes/routes";

// Get all cars
export const getCars = async (queryParams?: CarQueryParams): Promise<Car[]> => {
  const response = await authInstance.get(apiEndpoints.getCars(queryParams));
  return response.data;
};

// Get a single car by ID
export const getCar = async (id: number): Promise<Car> => {
  const response = await authInstance.get(apiEndpoints.getCarById(id));
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
