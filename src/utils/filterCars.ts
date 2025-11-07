import { Car, FuelType, BodyType } from "@/types";

export interface CarFilterState {
  brand: string[];
  model: string[];
  year: number[];
  fuelType: FuelType[];
  bodyType: BodyType[];
  gearbox: string[];
  wheelDrive: string[];
  mileageRange: {
    min?: number;
    max?: number;
  };
}

export const defaultCarFilters: CarFilterState = {
  brand: [],
  model: [],
  year: [],
  fuelType: [],
  bodyType: [],
  gearbox: [],
  wheelDrive: [],
  mileageRange: {},
};

export function filterCars(cars: Car[], filters: CarFilterState): Car[] {
  let filtered = [...cars];

  // Brand filter
  if (filters.brand.length > 0) {
    filtered = filtered.filter((c) => filters.brand.includes(c.brand));
  }

  // Model filter
  if (filters.model.length > 0) {
    filtered = filtered.filter((c) => filters.model.includes(c.model.name));
  }

  // Year filter
  if (filters.year.length > 0) {
    filtered = filtered.filter((c) => filters.year.includes(c.year));
  }

  // Fuel type filter
  if (filters.fuelType.length > 0) {
    filtered = filtered.filter((c) => {
      // Map API fuel name to FuelType enum
      const fuelName = c.fuel.name.toLowerCase();
      return filters.fuelType.some((ft) => fuelName.includes(ft.toLowerCase()));
    });
  }

  // Body type filter
  if (filters.bodyType.length > 0) {
    filtered = filtered.filter((c) => {
      // Map API body_type name to BodyType enum
      const bodyName = c.body_type.name.toLowerCase();
      return filters.bodyType.some((bt) => bodyName.includes(bt.toLowerCase()));
    });
  }

  // Gearbox filter
  if (filters.gearbox.length > 0) {
    filtered = filtered.filter((c) =>
      filters.gearbox.includes(c.gearbox_type.name)
    );
  }

  // Wheel drive filter
  if (filters.wheelDrive.length > 0) {
    filtered = filtered.filter((c) =>
      filters.wheelDrive.includes(c.wheel_drive.name)
    );
  }

  // Mileage range filter
  if (filters.mileageRange.min !== undefined) {
    filtered = filtered.filter((c) => c.mileage >= filters.mileageRange.min!);
  }
  if (filters.mileageRange.max !== undefined) {
    filtered = filtered.filter((c) => c.mileage <= filters.mileageRange.max!);
  }

  return filtered;
}
