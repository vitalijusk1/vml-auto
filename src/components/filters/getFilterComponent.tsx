import { FilterState } from "@/types";
import { LayoutType } from "./type";
import { PartFilters } from "./components/PartFilters/PartFilters";
import { AnalyticsFilters } from "./components/AnalyticsFilters/AnalyticsFilters";
import { OrderManagementFilters } from "./components/OrderManagementFilters/OrderManagementFilters";
import { OrdersFilters } from "./components/OrdersFilters/OrdersFilters";
import { ReturnsFilters } from "./components/ReturnsFilters/ReturnsFilters";

/**
 * Returns the appropriate filter component based on layout type.
 * Shared between FilterPanel and MobileFilterPanel to avoid duplication.
 */
export const getFilterComponent = (
  type: LayoutType,
  filters: FilterState,
  onFiltersChange: (updates: Partial<FilterState>) => void
) => {
  switch (type) {
    case LayoutType.PARTS:
      return (
        <PartFilters filters={filters} onFiltersChange={onFiltersChange} />
      );
    case LayoutType.ANALYTICS:
      return (
        <AnalyticsFilters filters={filters} onFiltersChange={onFiltersChange} />
      );
    case LayoutType.ORDER_CONTROL:
      return (
        <OrderManagementFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
        />
      );
    case LayoutType.ORDERS:
      return (
        <OrdersFilters filters={filters} onFiltersChange={onFiltersChange} />
      );
    case LayoutType.RETURNS:
      return (
        <ReturnsFilters filters={filters} onFiltersChange={onFiltersChange} />
      );
    default:
      return null;
  }
};
