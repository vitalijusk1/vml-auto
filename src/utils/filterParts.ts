import { Part, FilterState } from "@/types";
import { Car } from "@/types";

export const defaultFilters: FilterState = {
  search: "",
  status: "All",
  dateRange: {},
  carBrand: [],
  carModel: [],
  carYear: [],
  yearRange: {},
  fuelType: [],
  bodyType: [],
  partCategory: [],
  partType: [],
  quality: [],
  position: [],
  priceRange: {},
  inventoryAge: {},
  staleMonths: undefined,
};

export function filterParts(
  parts: Part[],
  filters: FilterState,
  cars: Car[]
): Part[] {
  let filtered = [...parts];

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(searchLower) ||
        p.code.toLowerCase().includes(searchLower) ||
        p.manufacturerCode?.toLowerCase().includes(searchLower) ||
        p.carBrand.toLowerCase().includes(searchLower) ||
        p.carModel.toLowerCase().includes(searchLower)
    );
  }

  // Status filter
  if (filters.status !== "All") {
    filtered = filtered.filter((p) => p.status === filters.status);
  }

  // Car brand filter
  if (filters.carBrand.length > 0) {
    filtered = filtered.filter((p) => filters.carBrand.includes(p.carBrand));
  }

  // Car model filter
  if (filters.carModel.length > 0) {
    filtered = filtered.filter((p) => filters.carModel.includes(p.carModel));
  }

  // Car year filter
  if (filters.carYear.length > 0) {
    filtered = filtered.filter((p) => filters.carYear.includes(p.carYear));
  }

  // Year range filter
  if (filters.yearRange.min !== undefined) {
    filtered = filtered.filter((p) => p.carYear >= filters.yearRange.min!);
  }
  if (filters.yearRange.max !== undefined) {
    filtered = filtered.filter((p) => p.carYear <= filters.yearRange.max!);
  }

  // Fuel type filter
  if (filters.fuelType.length > 0) {
    const carFuelTypes = cars
      .filter((c) => {
        const fuelName = c.fuel.name.toLowerCase();
        return filters.fuelType.some((ft) =>
          fuelName.includes(ft.toLowerCase())
        );
      })
      .map((c) => c.id.toString());
    filtered = filtered.filter((p) => carFuelTypes.includes(p.carId));
  }

  // Body type filter
  if (filters.bodyType.length > 0) {
    const carBodyTypes = cars
      .filter((c) => {
        const bodyName = c.body_type.name.toLowerCase();
        return filters.bodyType.some((bt) =>
          bodyName.includes(bt.toLowerCase())
        );
      })
      .map((c) => c.id.toString());
    filtered = filtered.filter((p) => carBodyTypes.includes(p.carId));
  }

  // Part category filter
  if (filters.partCategory.length > 0) {
    filtered = filtered.filter((p) =>
      filters.partCategory.includes(p.category)
    );
  }

  // Part type filter
  if (filters.partType.length > 0) {
    filtered = filtered.filter((p) => filters.partType.includes(p.partType));
  }

  // Position filter
  if (filters.position.length > 0) {
    filtered = filtered.filter(
      (p) => p.position && filters.position.includes(p.position)
    );
  }

  // Price range filter
  if (filters.priceRange.min !== undefined) {
    filtered = filtered.filter((p) => p.priceEUR >= filters.priceRange.min!);
  }
  if (filters.priceRange.max !== undefined) {
    filtered = filtered.filter((p) => p.priceEUR <= filters.priceRange.max!);
  }

  // Date range filter
  if (filters.dateRange.from) {
    filtered = filtered.filter((p) => p.dateAdded >= filters.dateRange.from!);
  }
  if (filters.dateRange.to) {
    filtered = filtered.filter((p) => p.dateAdded <= filters.dateRange.to!);
  }

  // Inventory age filter
  if (filters.inventoryAge.notSoldMonths) {
    const monthsAgo = new Date();
    monthsAgo.setMonth(
      monthsAgo.getMonth() - filters.inventoryAge.notSoldMonths!
    );
    filtered = filtered.filter(
      (p) => p.status === "In Stock" && p.dateAdded <= monthsAgo
    );
  }
  if (filters.inventoryAge.quickFilter === "stale") {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    filtered = filtered.filter(
      (p) => p.status === "In Stock" && p.dateAdded <= sixMonthsAgo
    );
  }
  if (filters.inventoryAge.quickFilter === "new") {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    filtered = filtered.filter((p) => p.dateAdded >= oneMonthAgo);
  }

  // Stale months filter
  if (filters.staleMonths !== undefined) {
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - filters.staleMonths);
    filtered = filtered.filter(
      (p) => p.status === "In Stock" && p.dateAdded <= monthsAgo
    );
  }

  return filtered;
}
