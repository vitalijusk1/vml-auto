import authInstance from "./axios";
import { Return } from "@/types";
import { apiEndpoints } from "./routes/routes";

// Get all returns
export const getReturns = async (): Promise<Return[]> => {
  const response = await authInstance.get(apiEndpoints.getReturns());
  return response.data;
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

