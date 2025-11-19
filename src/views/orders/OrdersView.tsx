import {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
  startTransition,
} from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectOrders,
  selectBackendFilters,
  selectFilters,
} from "@/store/selectors";
import { FilterState, Order } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { setOrders } from "@/store/slices/dataSlice";
import { setFilters } from "@/store/slices/filtersSlice";
import { getOrders, filterStateToOrdersQueryParams } from "@/api/orders";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { LayoutType } from "@/components/filters/type";
import { Table } from "@/components/tables/Table";
import { PhotoGalleryModal } from "@/components/modals/PhotoGalleryModal";
import { renderOrderExpandedContent } from "@/components/tables/components/OrderTableColumns";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { FilterLoadingCard } from "@/components/ui/FilterLoadingCard";
import { store } from "@/store";

// Separate component that subscribes to filters - this isolates re-renders
// Only this component re-renders when filters change, not OrdersView
const FilterPanelContainer = memo(function FilterPanelContainer({
  onFiltersChange,
  onFilter,
  isLoading,
}: {
  onFiltersChange: (filters: FilterState) => void;
  onFilter: () => void;
  isLoading: boolean;
}) {
  const filters = useAppSelector(selectFilters);
  return (
    <FilterPanel
      type="parts"
      filters={filters}
      onFiltersChange={onFiltersChange}
      cars={[]}
      onFilter={onFilter}
      isLoading={isLoading}
      hideCategoriesAndWheels={true}
      hideTopDetailsFilter={true}
    />
  );
});

export function OrdersView() {
  console.log("rerender");
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const backendFilters = useAppSelector(selectBackendFilters);

  // Use ref to get latest filters without subscribing (prevents re-renders)
  const filtersRef = useRef<FilterState>(store.getState().filters);
  const filtersKeyRef = useRef<string>(
    JSON.stringify(store.getState().filters)
  );
  const paginationRef = useRef({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  });
  const backendFiltersRef = useRef(backendFilters);
  const dispatchRef = useRef(dispatch);
  const isLoadingRef = useRef(false);
  const setIsLoadingOrdersRef = useRef<((loading: boolean) => void) | null>(
    null
  );

  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedPhotoGallery, setSelectedPhotoGallery] = useState<{
    photos: string[];
    title: string;
  } | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  });

  // Keep refs in sync
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    backendFiltersRef.current = backendFilters;
  }, [backendFilters]);

  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  useEffect(() => {
    setIsLoadingOrdersRef.current = setIsLoadingOrders;
  }, []);

  // Note: Filters are fetched in App.tsx on initial load, no need to fetch here

  // Fetch function that updates loading state only when actually needed
  const fetchOrders = useCallback(
    async (resetPage = false, skipLoadingState = false) => {
      if (!backendFiltersRef.current) {
        return;
      }

      // Only update loading state if not already loading and not skipping (prevents unnecessary re-renders)
      if (
        !skipLoadingState &&
        !isLoadingRef.current &&
        setIsLoadingOrdersRef.current
      ) {
        isLoadingRef.current = true;
        // Use setTimeout to defer loading state update, allowing filter change to complete without re-render
        setTimeout(() => {
          if (setIsLoadingOrdersRef.current) {
            setIsLoadingOrdersRef.current(true);
          }
        }, 0);
      }

      try {
        const queryParams = filterStateToOrdersQueryParams(
          filtersRef.current,
          backendFiltersRef.current
        );

        const currentPage = resetPage ? 1 : paginationRef.current.current_page;
        queryParams.page = currentPage;
        queryParams.per_page = paginationRef.current.per_page || 15;

        console.log("Fetching orders with params:", queryParams);

        const response = await getOrders(queryParams);

        console.log("Orders response:", response);
        dispatchRef.current(setOrders(response.orders));
        // Use startTransition to batch pagination update, preventing immediate re-render
        startTransition(() => {
          setPagination({
            ...response.pagination,
            current_page: currentPage,
          });
        });
      } catch (error) {
        console.error("Error fetching orders:", error);
        dispatchRef.current(setOrders([]));
      } finally {
        if (!skipLoadingState && setIsLoadingOrdersRef.current) {
          isLoadingRef.current = false;
          setIsLoadingOrdersRef.current(false);
        }
      }
    },
    []
  );

  // Update refs when filters change (but don't fetch - wait for filter button click)
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const currentFilters = store.getState().filters;
      const currentKey = JSON.stringify(currentFilters);

      // Only update refs if filters changed (don't fetch automatically)
      if (currentKey !== filtersKeyRef.current) {
        filtersRef.current = currentFilters;
        filtersKeyRef.current = currentKey;
        // Don't fetch here - wait for user to click "Filtruoti" button
      }
    });
    return unsubscribe;
  }, []);

  // Fetch initial data on mount or when backendFilters become available
  useEffect(() => {
    if (backendFilters && orders.length === 0) {
      // Only fetch if we don't have orders yet (initial load)
      fetchOrders(false, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendFilters]); // Run when backendFilters become available

  // Fetch orders when pagination changes (but not when filters change - handled above)
  useEffect(() => {
    // Only fetch if we already have orders (meaning filters were applied or initial load happened)
    if (backendFilters && orders.length > 0 && pagination.current_page > 0) {
      fetchOrders(false, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current_page, pagination.per_page]);

  // Always expand all orders by default when orders change
  useEffect(() => {
    if (orders.length > 0) {
      setExpandedOrders(new Set(orders.map((o) => o.id)));
    }
  }, [orders]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  const handlePhotoClick = useCallback((photos: string[], title: string) => {
    setSelectedPhotoGallery({ photos, title });
  }, []);

  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const handleFilter = useCallback(() => {
    // Reset to page 1 when filtering
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    // Fetch orders with current filters
    fetchOrders(true, false); // true = reset to page 1, false = show loading state
  }, [fetchOrders]);

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
    }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      per_page: pageSize,
      current_page: 1,
    }));
  }, []);

  const renderExpandedRow = useCallback(
    (order: Order) => renderOrderExpandedContent(order, handlePhotoClick),
    [handlePhotoClick]
  );

  // Custom filter function for orders (filters across multiple fields)
  const orderFilterFn = useCallback(
    (orders: Order[], filterValue: string): Order[] => {
      if (!filterValue.trim()) {
        return orders;
      }
      const filterLower = filterValue.toLowerCase();
      return orders.filter((order) => {
        return (
          order.id.toLowerCase().includes(filterLower) ||
          order.customer?.name?.toLowerCase().includes(filterLower) ||
          order.customer?.country?.toLowerCase().includes(filterLower) ||
          order.items.some((item) =>
            item.partName.toLowerCase().includes(filterLower)
          )
        );
      });
    },
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Užsakymai"
        description="Valdykite ir filtruokite užsakymus"
      />

      {backendFilters && (
        <FilterPanelContainer
          onFiltersChange={handleFiltersChange}
          onFilter={handleFilter}
          isLoading={isLoadingOrders}
        />
      )}
      {!backendFilters && <FilterLoadingCard />}

      <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          {isLoadingOrders ? (
            <LoadingState message="Kraunami užsakymai..." />
          ) : (
            <Table<Order>
              type={LayoutType.ORDERS}
              data={orders}
              serverPagination={pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              expandedRows={expandedOrders}
              onToggleExpand={toggleOrderExpansion}
              renderExpandedRow={renderExpandedRow}
              filterColumnKey="id"
              filterPlaceholder="Filtruoti užsakymus..."
              customFilterFn={orderFilterFn}
            />
          )}
        </CardContent>
      </Card>

      {/* Photo Gallery Modal */}
      {selectedPhotoGallery && (
        <PhotoGalleryModal
          photos={selectedPhotoGallery.photos}
          title={selectedPhotoGallery.title}
          isOpen={!!selectedPhotoGallery}
          onClose={() => setSelectedPhotoGallery(null)}
        />
      )}
    </div>
  );
}
