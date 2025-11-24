import { Part, Order, Return, Car } from "@/types";

/**
 * Unified table filtering utilities
 * Provides consistent filtering across all table types
 */

export interface FilterFunction<T> {
  (data: T[], filterValue: string): T[];
}

/**
 * Generic text search helper
 */
const matchesText = (value: any, searchTerm: string): boolean => {
  if (!value) return false;
  return String(value).toLowerCase().includes(searchTerm.toLowerCase());
};

/**
 * Parts filter function
 * Searches across: name, code, manufacturerCode, car info, category
 */
export const createPartsFilter = (): FilterFunction<Part> => {
  return (parts: Part[], filterValue: string): Part[] => {
    if (!filterValue.trim()) {
      return parts;
    }

    const searchTerm = filterValue.toLowerCase();

    return parts.filter((part) => {
      // Search in basic part info
      if (
        matchesText(part.name, searchTerm) ||
        matchesText(part.code, searchTerm) ||
        matchesText(part.manufacturerCode, searchTerm) ||
        matchesText(part.category, searchTerm) ||
        matchesText(part.partType, searchTerm)
      ) {
        return true;
      }

      // Search in car information
      if (
        matchesText(part.carBrand, searchTerm) ||
        matchesText(part.carModel, searchTerm) ||
        matchesText(part.carYear, searchTerm) ||
        matchesText(part.fuelType, searchTerm) ||
        matchesText(part.engineVolume, searchTerm)
      ) {
        return true;
      }

      // Search in price (convert to string for partial matches)
      if (matchesText(part.priceEUR?.toString(), searchTerm)) {
        return true;
      }

      // Search in status, quality, position
      if (
        matchesText(part.status, searchTerm) ||
        matchesText(part.quality, searchTerm) ||
        matchesText(part.position, searchTerm) ||
        matchesText(part.warehouse, searchTerm)
      ) {
        return true;
      }

      return false;
    });
  };
};

/**
 * Orders filter function
 * Searches across: order ID, customer info, item names
 */
export const createOrdersFilter = (): FilterFunction<Order> => {
  return (orders: Order[], filterValue: string): Order[] => {
    if (!filterValue.trim()) {
      return orders;
    }

    const searchTerm = filterValue.toLowerCase();

    return orders.filter((order) => {
      // Search in order basic info
      if (
        matchesText(order.id, searchTerm) ||
        matchesText(order.status, searchTerm)
      ) {
        return true;
      }

      // Search in customer info
      if (
        matchesText(order.customer?.name, searchTerm) ||
        matchesText(order.customer?.email, searchTerm) ||
        matchesText(order.customer?.phone, searchTerm) ||
        matchesText(order.customer?.country, searchTerm)
      ) {
        return true;
      }

      // Search in order items
      if (
        order.items.some(
          (item) =>
            matchesText(item.partName, searchTerm) ||
            matchesText(item.partId, searchTerm) ||
            matchesText(item.manufacturerCode, searchTerm) ||
            matchesText(item.carBrand, searchTerm) ||
            matchesText(item.carModel, searchTerm)
        )
      ) {
        return true;
      }

      return false;
    });
  };
};

/**
 * Returns filter function
 * Searches across: return ID, order ID, customer info, item names, reason
 */
export const createReturnsFilter = (): FilterFunction<Return> => {
  return (returns: Return[], filterValue: string): Return[] => {
    if (!filterValue.trim()) {
      return returns;
    }

    const searchTerm = filterValue.toLowerCase();

    return returns.filter((returnItem) => {
      // Search in return basic info
      if (
        matchesText(returnItem.id, searchTerm) ||
        matchesText(returnItem.orderId, searchTerm) ||
        matchesText(returnItem.status, searchTerm)
      ) {
        return true;
      }

      // Search in customer info
      if (
        matchesText(returnItem.customer?.name, searchTerm) ||
        matchesText(returnItem.customer?.email, searchTerm) ||
        matchesText(returnItem.customer?.country, searchTerm)
      ) {
        return true;
      }

      // Search in return items
      if (
        returnItem.items.some(
          (item) =>
            matchesText(item.partName, searchTerm) ||
            matchesText(item.partId, searchTerm) ||
            matchesText((item as any).manufacturerCode, searchTerm) ||
            matchesText((item as any).reason, searchTerm) ||
            matchesText((item as any).carBrand, searchTerm) ||
            matchesText((item as any).carModel, searchTerm)
        )
      ) {
        return true;
      }

      return false;
    });
  };
};

/**
 * Cars filter function
 * Searches across: brand, model, year, body type, fuel type, engine
 */
export const createCarsFilter = (): FilterFunction<Car> => {
  return (cars: Car[], filterValue: string): Car[] => {
    if (!filterValue.trim()) {
      return cars;
    }

    const searchTerm = filterValue.toLowerCase();

    return cars.filter((car) => {
      return (
        matchesText(car.brand?.name, searchTerm) ||
        matchesText(car.model?.name, searchTerm) ||
        matchesText(car.year, searchTerm) ||
        matchesText(car.model_year, searchTerm) ||
        matchesText(car.body_type?.name, searchTerm) ||
        matchesText(car.fuel?.name, searchTerm) ||
        matchesText(car.engine?.capacity, searchTerm) ||
        matchesText(car.engine?.code, searchTerm) ||
        matchesText(car.engine?.power, searchTerm) ||
        matchesText(car.category?.name, searchTerm) ||
        matchesText(car.color?.name, searchTerm) ||
        matchesText(car.gearbox_type?.name, searchTerm) ||
        matchesText(car.wheel_drive?.name, searchTerm) ||
        matchesText(car.wheel_type?.name, searchTerm)
      );
    });
  };
};

/**
 * Factory function to get the appropriate filter for a table type
 */
export const getPartsFilter = () => createPartsFilter();
export const getOrdersFilter = () => createOrdersFilter();
export const getReturnsFilter = () => createReturnsFilter();
export const getCarsFilter = () => createCarsFilter();
