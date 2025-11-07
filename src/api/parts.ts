import authInstance from "./axios";
import { Part } from "@/types";
import { apiEndpoints } from "./routes/routes";

// Get all parts
export const getParts = async (): Promise<Part[]> => {
  const response = await authInstance.get(apiEndpoints.getParts());
  return response.data;
};

// Get a single part by ID
export const getPart = async (id: string): Promise<Part> => {
  const response = await authInstance.get(apiEndpoints.getPartById(id));
  return response.data;
};

// Create a new part
export const createPart = async (part: Omit<Part, "id">): Promise<Part> => {
  const response = await authInstance.post(apiEndpoints.createPart(), part);
  return response.data;
};

// Update a part
export const updatePart = async (
  id: string,
  part: Partial<Part>
): Promise<Part> => {
  const response = await authInstance.put(apiEndpoints.updatePart(id), part);
  return response.data;
};

// Delete a part
export const deletePart = async (id: string): Promise<void> => {
  await authInstance.delete(apiEndpoints.deletePart(id));
};

