// Export the authenticated axios instance
export { default as authInstance } from "./axios";

// Export routes and types
export * from "./routes/routes";

// Export API functions
export * from "./cars";
export { getFilters as getPartsFilters } from "./parts";
export { getParts, getPartsByIds, filterStateToQueryParams } from "./parts";
export * from "./orders";
export * from "./returns";
