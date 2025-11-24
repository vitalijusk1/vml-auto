import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectOrders, selectBackendFilters } from "@/store/selectors";
import { Order } from "@/types";
import { LayoutType } from "@/components/filters/type";
import { Table } from "@/components/tables/Table";
import { PhotoGalleryModal } from "@/components/modals/PhotoGalleryModal";
import { renderOrderExpandedContent } from "@/components/tables/components/OrderTableColumns";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterLoadingCard } from "@/components/ui/FilterLoadingCard";
import { OrdersFilterCard } from "./components/OrdersFilterCard";
import { useTablePagination } from "@/hooks/useTablePagination";
import { getOrdersFilter } from "@/utils/tableFilters";

export function OrdersView() {
  const orders = useAppSelector(selectOrders);
  const backendFilters = useAppSelector(selectBackendFilters);

  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedPhotoGallery, setSelectedPhotoGallery] = useState<{
    photos: string[];
    title: string;
  } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const {
    pagination,
    handlePaginationUpdate,
    handlePageChange,
    handlePageSizeChange,
  } = useTablePagination();

  // Check if we're on mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  const renderExpandedRow = useCallback(
    (order: Order) =>
      renderOrderExpandedContent(order, handlePhotoClick, isMobile),
    [handlePhotoClick, isMobile]
  );

  // Unified orders filter function
  const orderFilterFn = useCallback(getOrdersFilter(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Užsakymai"
        description="Valdykite ir filtruokite užsakymus"
      />

      {backendFilters && (
        <OrdersFilterCard
          onPaginationUpdate={handlePaginationUpdate}
          pagination={pagination}
          backendFilters={backendFilters}
        />
      )}
      {!backendFilters && <FilterLoadingCard />}

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
