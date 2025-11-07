import authInstance from "./axios";
import { Order } from "@/types";
import { apiEndpoints } from "./routes/routes";

// Get all orders
export const getOrders = async (): Promise<Order[]> => {
  const response = await authInstance.get(apiEndpoints.getOrders());
  return response.data;
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

