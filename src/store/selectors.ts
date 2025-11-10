import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "./index";
import { Part, DashboardMetrics } from "../types";
import { filterParts } from "../utils/filterParts";

// Base selectors
export const selectParts = (state: RootState) => state.data.parts;
export const selectOrders = (state: RootState) => state.data.orders;
export const selectReturns = (state: RootState) => state.data.returns;
export const selectBackendFilters = (state: RootState) => state.data.backendFilters;
export const selectFilters = (state: RootState) => state.filters;
export const selectSelectedParts = (state: RootState) => state.ui.selectedParts;
export const selectCurrentView = (state: RootState) => state.ui.currentView;
export const selectSidebarCollapsed = (state: RootState) =>
  state.ui.sidebarCollapsed;
export const selectCarsPagination = (state: RootState) =>
  state.ui.carsPagination;
export const selectPartsPagination = (state: RootState) =>
  state.ui.partsPagination;

// Computed selectors
// Note: selectFilteredParts now requires cars to be passed as parameter
// since cars are no longer in Redux store
export const makeSelectFilteredParts = (cars: any[]) =>
  createSelector([selectParts, selectFilters], (parts, filters) => {
    return filterParts(parts, filters, cars);
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
      .filter((o) => o.date >= startOfMonth && o.status === "Delivered")
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
      (p) => p.status === "In Stock" && p.dateAdded <= sixMonthsAgo
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
        .filter((o) => o.status === "Delivered")
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
        topParts = topParts.filter((p) =>
          combinedFilters.carBrand!.includes(p.carBrand)
        );
      }
      if (combinedFilters.carModel?.length) {
        topParts = topParts.filter((p) =>
          combinedFilters.carModel!.includes(p.carModel)
        );
      }
      if (combinedFilters.partCategory?.length) {
        topParts = topParts.filter((p) =>
          combinedFilters.partCategory!.includes(p.category)
        );
      }

      return topParts.slice(0, limit);
    }
  );
