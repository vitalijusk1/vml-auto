import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './index';
import { Part, DashboardMetrics } from '../types';

// Base selectors
export const selectParts = (state: RootState) => state.data.parts;
export const selectCars = (state: RootState) => state.data.cars;
export const selectOrders = (state: RootState) => state.data.orders;
export const selectReturns = (state: RootState) => state.data.returns;
export const selectFilters = (state: RootState) => state.filters;
export const selectSelectedParts = (state: RootState) => state.ui.selectedParts;
export const selectCurrentView = (state: RootState) => state.ui.currentView;
export const selectInitialized = (state: RootState) => state.data.initialized;

// Computed selectors
export const selectFilteredParts = createSelector(
  [selectParts, selectFilters, selectCars],
  (parts, filters, cars) => {
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
    if (filters.status !== 'All') {
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

    // Fuel type filter
    if (filters.fuelType.length > 0) {
      const carFuelTypes = cars
        .filter((c) => filters.fuelType.includes(c.fuelType))
        .map((c) => c.id);
      filtered = filtered.filter((p) => carFuelTypes.includes(p.carId));
    }

    // Body type filter
    if (filters.bodyType.length > 0) {
      const carBodyTypes = cars
        .filter((c) => filters.bodyType.includes(c.bodyType))
        .map((c) => c.id);
      filtered = filtered.filter((p) => carBodyTypes.includes(p.carId));
    }

    // Part category filter
    if (filters.partCategory.length > 0) {
      filtered = filtered.filter((p) => filters.partCategory.includes(p.category));
    }

    // Part type filter
    if (filters.partType.length > 0) {
      filtered = filtered.filter((p) => filters.partType.includes(p.partType));
    }

    // Quality filter
    if (filters.quality.length > 0) {
      filtered = filtered.filter((p) => filters.quality.includes(p.quality));
    }

    // Position filter
    if (filters.position.length > 0) {
      filtered = filtered.filter((p) => p.position && filters.position.includes(p.position));
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
      monthsAgo.setMonth(monthsAgo.getMonth() - filters.inventoryAge.notSoldMonths!);
      filtered = filtered.filter(
        (p) => p.status === 'In Stock' && p.dateAdded <= monthsAgo
      );
    }
    if (filters.inventoryAge.quickFilter === 'stale') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      filtered = filtered.filter(
        (p) => p.status === 'In Stock' && p.dateAdded <= sixMonthsAgo
      );
    }
    if (filters.inventoryAge.quickFilter === 'new') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      filtered = filtered.filter((p) => p.dateAdded >= oneMonthAgo);
    }

    return filtered;
  }
);

export const selectMetrics = createSelector(
  [selectParts, selectOrders],
  (parts, orders): DashboardMetrics => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalPartsInStock = parts.filter((p) => p.status === 'In Stock').length;
    const totalPartsSold = parts.filter((p) => p.status === 'Sold').length;
    const totalPartsAllTime = parts.length;

    const revenueCurrentMonth = orders
      .filter((o) => o.date >= startOfMonth && o.status === 'Delivered')
      .reduce((sum, o) => sum + o.totalAmountEUR, 0);

    const categorySales = parts
      .filter((p) => p.status === 'Sold')
      .reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topSellingCategory = Object.entries(categorySales).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0] || 'N/A';

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const partsOlderThan6Months = parts.filter(
      (p) => p.status === 'In Stock' && p.dateAdded <= sixMonthsAgo
    ).length;

    return {
      totalPartsInStock,
      totalPartsSold,
      totalPartsAllTime,
      revenueCurrentMonth,
      topSellingCategory,
      partsOlderThan6Months,
    };
  }
);

export const makeSelectTopPerformers = (limit: number, additionalFilters?: Partial<RootState['filters']>) =>
  createSelector(
    [selectParts, selectFilters, selectOrders],
    (parts, filters, orders): Part[] => {
      const combinedFilters = { ...filters, ...additionalFilters };

      // Count sales per part code/name (since same part can be sold multiple times)
      const partSalesCount: Record<string, { part: Part; count: number }> = {};

      // Get all sold parts from orders
      orders
        .filter((o) => o.status === 'Delivered')
        .forEach((order) => {
          order.items.forEach((item) => {
            const part = parts.find((p) => p.id === item.partId);
            if (part) {
              const key = `${part.code}-${part.name}`;
              if (!partSalesCount[key]) {
                partSalesCount[key] = { part, count: 0 };
              }
              partSalesCount[key].count += item.quantity;
            }
          });
        });

      // Convert to array and sort by sales count
      let topParts = Object.values(partSalesCount)
        .map(({ part, count }) => ({ ...part, salesCount: count }))
        .sort((a, b) => b.salesCount - a.salesCount);

      // Apply additional filters if provided
      if (combinedFilters.carBrand?.length) {
        topParts = topParts.filter((p) => combinedFilters.carBrand!.includes(p.carBrand));
      }
      if (combinedFilters.carModel?.length) {
        topParts = topParts.filter((p) => combinedFilters.carModel!.includes(p.carModel));
      }
      if (combinedFilters.partCategory?.length) {
        topParts = topParts.filter((p) => combinedFilters.partCategory!.includes(p.category));
      }

      return topParts.slice(0, limit);
    }
  );

