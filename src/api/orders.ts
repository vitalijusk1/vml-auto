import authInstance from "./axios";
import { Order, Part, PartStatus } from "@/types";
import { apiEndpoints } from "./routes/routes";
import { Category } from "@/utils/filterCars";

// Get all orders
export const getOrders = async (): Promise<Order[]> => {
  const response = await authInstance.get(apiEndpoints.getOrders());
  // Handle different response structures
  const data = response.data;
  // If data is an array, return it directly
  if (Array.isArray(data)) {
    return data;
  }
  // If data has a data property that's an array, return that
  if (data && Array.isArray(data.data)) {
    return data.data;
  }
  // If data has a success property and data array
  if (data && data.success && Array.isArray(data.data)) {
    return data.data;
  }
  // Fallback to empty array
  console.warn("Unexpected orders API response structure:", data);
  return [];
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

