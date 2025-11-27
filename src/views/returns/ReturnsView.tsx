import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { useIsMobile } from "@/hooks/useIsMobile";
import { selectReturns, selectBackendFilters } from "@/store/selectors";
import { Return } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutType } from "@/components/filters/type";
import { Table } from "@/components/tables/Table";
import { PhotoGalleryModal } from "@/components/modals/PhotoGalleryModal";
import { renderReturnExpandedContent } from "@/components/tables/components/ReturnTableColumns";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterLoadingCard } from "@/components/ui/FilterLoadingCard";
import { ReturnsFilterCard } from "./components/ReturnsFilterCard";
import { useTablePagination } from "@/components/tables/useTablePagination";
import { useDebounce } from "@/hooks/useDebounce";

export function ReturnsView() {
  const returns = useAppSelector(selectReturns);
  const backendFilters = useAppSelector(selectBackendFilters);

  const [expandedReturns, setExpandedReturns] = useState<Set<string>>(
    new Set()
  );
  const [selectedPhotoGallery, setSelectedPhotoGallery] = useState<{
    photos: string[];
    title: string;
  } | null>(null);
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 800);
  const {
    pagination,
    handlePaginationUpdate,
    handlePageChange,
    handlePageSizeChange,
  } = useTablePagination();

  // Always expand all returns by default when returns change
  useEffect(() => {
    if (returns.length > 0) {
      setExpandedReturns(new Set(returns.map((r) => r.id)));
    }
  }, [returns]);

  const toggleReturnExpansion = useCallback((returnId: string) => {
    setExpandedReturns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(returnId)) {
        newSet.delete(returnId);
      } else {
        newSet.add(returnId);
      }
      return newSet;
    });
  }, []);

  const handlePhotoClick = useCallback((photos: string[], title: string) => {
    setSelectedPhotoGallery({ photos, title });
  }, []);

  const renderExpandedRow = useCallback(
    (returnItem: Return) =>
      renderReturnExpandedContent(returnItem, handlePhotoClick, isMobile),
    [handlePhotoClick, isMobile]
  );

  // Handle search change from table
  const handleSearchChange = useCallback((search: string) => {
    setSearchQuery(search);
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grąžinimai"
        description="Valdykite ir filtruokite grąžinimus"
      />

      {backendFilters && (
        <ReturnsFilterCard
          onPaginationUpdate={handlePaginationUpdate}
          pagination={pagination}
          backendFilters={backendFilters}
          searchQuery={debouncedSearchQuery}
          onLoadingChange={setIsLoading}
        />
      )}
      {!backendFilters && <FilterLoadingCard />}

      <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          <Table<Return>
            type={LayoutType.RETURNS}
            data={returns}
            serverPagination={pagination}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            expandedRows={expandedReturns}
            onToggleExpand={toggleReturnExpansion}
            onSearchChange={handleSearchChange}
            renderExpandedRow={renderExpandedRow}
            filterColumnKey="id"
            filterPlaceholder="Filtruoti grąžinimus..."
            isLoading={isLoading}
          />
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
