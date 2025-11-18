// Alternative: as const object (easier interop, better type inference)
export const LayoutType = {
  PARTS: "parts",
  ANALYTICS: "analytics",
  ORDER_CONTROL: "order-control",
  ORDERS: "orders",
  RETURNS: "returns",
} as const;

export type LayoutType =
  | "parts"
  | "analytics"
  | "order-control"
  | "orders"
  | "returns";
