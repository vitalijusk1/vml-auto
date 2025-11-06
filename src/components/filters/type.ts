// Alternative: as const object (easier interop, better type inference)
export const FilterType = {
  CAR: "car",
  PARTS: "parts",
  ANALYTICS: "analytics",
} as const;

export type FilterType = "car" | "parts" | "analytics";
