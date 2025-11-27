import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { Part, DashboardMetrics } from "../types";

// Base selectors
export const selectParts = (state: RootState) => {
  const parts = state.data.parts;
  return Array.isArray(parts) ? parts : [];
};
export const selectOrders = (state: RootState) => {
  const orders = state.data.orders;
  return Array.isArray(orders) ? orders : [];
};
export const selectReturns = (state: RootState) => {
  const returns = state.data.returns;
  return Array.isArray(returns) ? returns : [];
};
export const selectBackendFilters = (state: RootState) =>
  state.data.backendFilters;
export const selectCars = (state: RootState) => {
  const cars = state.data.cars;
  return Array.isArray(cars) ? cars : [];
};
export const selectAnalyticsOverviewData = (state: RootState) =>
  state.data.analyticsOverviewData;
export const selectAnalyticsPartsData = (state: RootState) =>
  state.data.analyticsPartsData;
export const selectFilters = (state: RootState) => state.filters;
export const selectCurrentView = (state: RootState) => state.ui.currentView;
export const selectSidebarCollapsed = (state: RootState) =>
  state.ui.sidebarCollapsed;
export const selectOrderControlSelectedCarId = (state: RootState) =>
  state.ui.orderControlSelectedCarId;

// Auth selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;

// Computed selectors
// Note: All filtering is now handled by the backend
// This selector is kept for compatibility but returns parts unchanged
export const makeSelectFilteredParts = () =>
  createSelector([selectParts], (parts) => {
    // All filtering is handled by backend, return parts as-is
    return parts;
  });

export const selectMetrics = createSelector(
  [selectParts, selectOrders],
  (parts, orders): DashboardMetrics => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const totalPartsInStock = parts.filter(
      (p) => p.status === "In Stock"
    ).length;
    const totalPartsSold = parts.filter((p) => p.status === "Sold").length;
    const totalPartsAllTime = parts.length;

    const revenueCurrentMonth = orders
      .filter(
        (o) => new Date(o.date) >= startOfMonth && o.status === "DELIVERED"
      )
      .reduce((sum, o) => sum + o.totalAmountEUR, 0);

    const categorySales = parts
      .filter((p) => p.status === "Sold")
      .reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const topSellingCategory =
      Object.entries(categorySales).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "N/A";

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const partsOlderThan6Months = parts.filter(
      (p) => p.status === "In Stock" && new Date(p.dateAdded) <= sixMonthsAgo
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

export const makeSelectTopPerformers = (
  limit: number,
  additionalFilters?: Partial<RootState["filters"]>
) =>
  createSelector(
    [selectParts, selectFilters, selectOrders],
    (parts, filters, orders): Part[] => {
      const combinedFilters = { ...filters, ...additionalFilters };

      // Count sales per part code/name (since same part can be sold multiple times)
      const partSalesCount: Record<string, { part: Part; count: number }> = {};

      // Get all sold parts from orders
      orders
        .filter((o) => o.status === "DELIVERED")
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
        const brandNames = new Set(
          combinedFilters.carBrand.map((brand) => brand.name)
        );
        topParts = topParts.filter((p) => brandNames.has(p.carBrand));
      }
      if (combinedFilters.carModel?.length) {
        const modelNames = new Set(
          combinedFilters.carModel.map((model) => model.name)
        );
        topParts = topParts.filter((p) => modelNames.has(p.carModel));
      }
      if (combinedFilters.partCategory?.length) {
        const categoryNames = new Set(
          combinedFilters.partCategory.map((cat) => cat.name)
        );
        topParts = topParts.filter((p) => categoryNames.has(p.category));
      }

      return topParts.slice(0, limit);
    }
  );
