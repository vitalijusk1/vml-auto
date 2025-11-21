import { useState, useEffect, useCallback, memo } from "react";
import { FilterState } from "@/types";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { LayoutType } from "@/components/filters/type";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setAnalyticsOverviewData,
  setAnalyticsPartsData,
} from "@/store/slices/dataSlice";
import {
  getStatisticsOverview,
  getStatisticsParts,
  filterStateToStatisticsQueryParams,
} from "@/api/statistics";
import { StorageKeys } from "@/utils/storageKeys";
import { loadPersistedFilters } from "@/utils/storageHelpers";
import { Card, CardContent } from "@/components/ui/card";
import { selectBackendFilters } from "@/store/selectors";

// Separate component that manages local filter state - this isolates re-renders
// Only this component re-renders when filters change, not AnalyticsView
export const AnalyticsFilterCard = memo(function AnalyticsFilterCard() {
  const dispatch = useAppDispatch();
  const backendFilters = useAppSelector(selectBackendFilters);
  const [filters, setFilters] = useState<FilterState>(
    loadPersistedFilters(StorageKeys.ANALYTICS_FILTERS)
  );
  const [isLoading, setIsLoading] = useState(false);

  // Persist filters to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(
        StorageKeys.ANALYTICS_FILTERS,
        JSON.stringify(filters)
      );
    } catch (error) {
      console.error("Error saving filters to sessionStorage:", error);
    }
  }, [filters]);

  // Load analytics data on component mount
  useEffect(() => {
    let isMounted = true;

    const loadMetrics = async () => {
      try {
        const overview = await getStatisticsOverview();
        const parts = await getStatisticsParts();

        if (!isMounted) return;

        dispatch(setAnalyticsOverviewData(overview));
        dispatch(setAnalyticsPartsData(parts));
      } catch (error) {
        console.error("Failed to load analytics metrics", error);
      }
    };

    loadMetrics();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  const handleFiltersChange = useCallback((updates: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const handleApplyFilters = useCallback(async () => {
    // Convert filters to query parameters
    const queryParams = filterStateToStatisticsQueryParams(filters);

    // Reload analytics data with current filters
    setIsLoading(true);
    try {
      const overview = await getStatisticsOverview(queryParams);
      const parts = await getStatisticsParts(queryParams);

      dispatch(setAnalyticsOverviewData(overview));
      dispatch(setAnalyticsPartsData(parts));
    } catch (error) {
      console.error("Failed to load analytics metrics", error);
    } finally {
      setIsLoading(false);
    }
  }, [filters, dispatch]);

  if (!backendFilters) {
    return (
      <Card>
        <CardContent>
          <p className="text-muted-foreground text-sm">Kraunami filtrai...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <FilterPanel
      type={LayoutType.ANALYTICS}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onFilter={handleApplyFilters}
      isLoading={isLoading}
      hideCategoriesAndWheels={true}
      hideTopDetailsFilter={true}
    />
  );
});
