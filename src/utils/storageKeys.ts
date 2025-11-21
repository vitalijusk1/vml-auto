/**
 * Centralized storage keys for the application.
 * These keys are used for localStorage and sessionStorage.
 */
export const StorageKeys = {
  // Filter storage keys (sessionStorage - resets when tab closes)
  PARTS_FILTERS: "partsFilters",
  ORDERS_FILTERS: "ordersFilters",
  RETURNS_FILTERS: "returnsFilters",
  ORDER_CONTROL_STATE: "orderControlState",
  ANALYTICS_FILTERS: "analyticsFilters",
} as const;

/**
 * Type representing the values of StorageKeys
 */
export type StorageKey = (typeof StorageKeys)[keyof typeof StorageKeys];
