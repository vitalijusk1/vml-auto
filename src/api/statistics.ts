import authInstance from "./axios";
import { apiEndpoints, StatisticsOverviewQueryParams } from "./routes/routes";
import { FilterState } from "@/types";

export interface OrderStatusBreakdown {
  name: string;
  value: number;
}

export interface StatisticsOverviewData {
  total_orders: number;
  total_revenue: number;
  total_parts: number;
  total_cars: number;
  average_order_value: number;
  orders_by_status: OrderStatusBreakdown[];
  recent_orders_count: number;
}

export interface StatisticsPartsCategoryData {
  name: string;
  value: number;
  category_id: number;
}

export interface StatisticsPartsData {
  total_parts: number;
  parts_by_quality: Array<{ name: string; value: number; quality: number }>;
  parts_by_status: Array<{ name: string; value: number; status: number }>;
  parts_by_category: StatisticsPartsCategoryData[];
  parts_by_position: Array<{ name: string; value: number; position: string }>;
}

interface StatisticsOverviewResponse {
  success: boolean;
  data: StatisticsOverviewData;
}

interface StatisticsPartsResponse {
  success: boolean;
  data: StatisticsPartsData;
}

export const getStatisticsOverview = async (
  queryParams?: StatisticsOverviewQueryParams
): Promise<StatisticsOverviewData> => {
  const endpoint = apiEndpoints.getStatisticsOverview(queryParams);
  const response = await authInstance.get<StatisticsOverviewResponse>(endpoint);
  return response.data.data;
};

export const getStatisticsParts = async (
  queryParams?: StatisticsOverviewQueryParams
): Promise<StatisticsPartsData> => {
  const endpoint = apiEndpoints.getStatisticsParts(queryParams);
  const response = await authInstance.get<StatisticsPartsResponse>(endpoint);
  return response.data.data;
};

/**
 * Convert FilterState to StatisticsOverviewQueryParams for API requests
 * Supports filtering by date range, car brand/model, part category, quality, and position
 */
export const filterStateToStatisticsQueryParams = (
  filters: FilterState
): StatisticsOverviewQueryParams => {
  const params: StatisticsOverviewQueryParams = {};

  // Date range
  if (filters.dateRange?.from) {
    const fromDate =
      filters.dateRange.from instanceof Date
        ? filters.dateRange.from.toISOString().split("T")[0]
        : filters.dateRange.from;
    params.date_from = fromDate;
  }
  if (filters.dateRange?.to) {
    const toDate =
      filters.dateRange.to instanceof Date
        ? filters.dateRange.to.toISOString().split("T")[0]
        : filters.dateRange.to;
    params.date_to = toDate;
  }

  // Car filters
  if (filters.carBrand && filters.carBrand.length > 0) {
    params.brand_id = filters.carBrand.map((b) => b.rrr_id ?? b.id);
  }
  if (filters.carModel && filters.carModel.length > 0) {
    params.model_id = filters.carModel.map((m) => m.rrr_id ?? m.id);
  }

  // Part filters
  if (filters.partCategory && filters.partCategory.length > 0) {
    params.category_id = filters.partCategory.map((c) => c.rrr_id ?? c.id);
  }
  if (filters.quality && filters.quality.length > 0) {
    params.quality = filters.quality.map((q) => q.rrr_id ?? q.id);
  }
  if (filters.position && filters.position.length > 0) {
    params.position = filters.position.map((p) => p.rrr_id ?? p.id);
  }

  return params;
};
