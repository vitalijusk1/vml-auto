import { useState, useEffect, useCallback, memo } from "react";
import { useAppDispatch } from "@/store/hooks";
import { getOrders, filterStateToOrdersQueryParams } from "@/api/orders";
import { FilterState } from "@/types";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { StorageKeys } from "@/utils/storageKeys";
import { loadPersistedFilters } from "@/utils/storageHelpers";
import { setOrders } from "@/store/slices/dataSlice";
import { startTransition } from "react";
import { LayoutType } from "@/components/filters/type";

interface OrdersFilterCardProps {
  onPaginationUpdate: (pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  }) => void;
  pagination: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
  backendFilters: any;
}

// Separate component that manages local filter state and fetching - this isolates re-renders
// Only this component re-renders when filters change, not OrdersView
export const OrdersFilterCard = memo(function OrdersFilterCard({
  onPaginationUpdate,
  pagination,
  backendFilters,
}: OrdersFilterCardProps) {
  const dispatch = useAppDispatch();
  const [filters, setFilters] = useState<FilterState>(
    loadPersistedFilters(StorageKeys.ORDERS_FILTERS)
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialFetched, setHasInitialFetched] = useState(false);

  // Persist filters to sessionStorage whenever they change
  useEffect(() => {
    try {
      sessionStorage.setItem(
        StorageKeys.ORDERS_FILTERS,
        JSON.stringify(filters)
      );
    } catch (error) {
      console.error("Error saving filters to sessionStorage:", error);
    }
  }, [filters]);

  // Fetch orders based on current filters
  const fetchOrders = useCallback(
    async (resetPage = false) => {
      if (!backendFilters) {
        return;
      }

      setIsLoading(true);

      try {
        const queryParams = filterStateToOrdersQueryParams(
          filters,
          backendFilters
        );

        const currentPage = resetPage ? 1 : pagination.current_page;
        queryParams.page = currentPage;
        queryParams.per_page = pagination.per_page || 15;

        const response = await getOrders(queryParams);
        dispatch(setOrders(response.orders));

        // Use startTransition to batch pagination update
        startTransition(() => {
          onPaginationUpdate({
            ...response.pagination,
            current_page: currentPage,
          });
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
        dispatch(setOrders([]));
      } finally {
        setIsLoading(false);
      }
    },
    [filters, pagination, backendFilters, dispatch, onPaginationUpdate]
  );

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters);
  }, []);

  const handleFilter = useCallback(() => {
    // Reset to page 1 when filtering
    onPaginationUpdate({
      ...pagination,
      current_page: 1,
    });
    // Fetch immediately when filter button is clicked
    fetchOrders(true);
  }, [pagination, onPaginationUpdate, fetchOrders]);

  // Fetch on initial load when backendFilters become available
  useEffect(() => {
    if (backendFilters && !hasInitialFetched) {
      fetchOrders(false);
      setHasInitialFetched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendFilters]);

  // Fetch when pagination changes (from table pagination controls)
  useEffect(() => {
    // Only fetch if we've done initial fetch and pagination changed
    if (hasInitialFetched) {
      fetchOrders(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current_page, pagination.per_page]);

  return (
    <FilterPanel
      type={LayoutType.PARTS}
      filters={filters}
      onFiltersChange={handleFiltersChange}
      onFilter={handleFilter}
      isLoading={isLoading}
      hideCategoriesAndWheels={true}
      hideTopDetailsFilter={true}
    />
  );
});
