import { useState, useEffect, useMemo, useCallback } from "react";
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

export function OrdersView() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const backendFilters = useAppSelector(selectBackendFilters);
  const filters = useAppSelector(selectFilters);
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

  // Note: Filters are fetched in App.tsx on initial load, no need to fetch here

  // Serialize filters to detect changes properly (React does shallow comparison)
  const filtersKey = useMemo(() => {
    return JSON.stringify(filters);
  }, [filters]);

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  }, [filtersKey]);

  // Fetch orders when filters or pagination change
  useEffect(() => {
    const fetchData = async () => {
      // Wait for backendFilters to load before fetching with filters
      // This prevents calling the API with invalid parameters
      if (!backendFilters) {
        return;
      }

      setIsLoadingOrders(true);
      try {
        // Convert filters to query parameters
        const queryParams = filterStateToOrdersQueryParams(
          filters,
          backendFilters
        );

        // Always add pagination parameters
        queryParams.page = pagination.current_page || 1;
        queryParams.per_page = pagination.per_page || 15;

        console.log("Fetching orders with params:", queryParams);

        // Fetch orders with filters and pagination
        const response = await getOrders(queryParams);

        console.log("Orders response:", response);
        dispatch(setOrders(response.orders));
        setPagination(response.pagination);
      } catch (error) {
        console.error("Error fetching orders:", error);
        // Set empty array on error so table still shows
        dispatch(setOrders([]));
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchData();
  }, [
    dispatch,
    filtersKey,
    backendFilters,
    pagination.current_page,
    pagination.per_page,
  ]);

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

  const handlePhotoClick = (photos: string[], title: string) => {
    setSelectedPhotoGallery({ photos, title });
  };

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
        <FilterPanel
          type="parts"
          filters={filters}
          onFiltersChange={(newFilters) => {
            dispatch(setFilters(newFilters as FilterState));
          }}
          cars={[]}
          onFilter={() => {
            // Filter button is handled by the useEffect that watches filtersKey
          }}
          isLoading={isLoadingOrders}
          hideCategoriesAndWheels={true}
          hideTopDetailsFilter={true}
          showOrderIdFilter={false}
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
              onPageChange={(page) => {
                setPagination((prev) => ({
                  ...prev,
                  current_page: page,
                }));
              }}
              onPageSizeChange={(pageSize) => {
                setPagination((prev) => ({
                  ...prev,
                  per_page: pageSize,
                  current_page: 1,
                }));
              }}
              expandedRows={expandedOrders}
              onToggleExpand={toggleOrderExpansion}
              renderExpandedRow={(order) =>
                renderOrderExpandedContent(order, handlePhotoClick)
              }
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
