// Alternative: as const object (easier interop, better type inference)
export const LayoutType = {
  CAR: "car",
  PARTS: "parts",
  ANALYTICS: "analytics",
  ORDER_MANAGEMENT: "order-management",
} as const;

export type LayoutType = "car" | "parts" | "analytics" | "order-management";
