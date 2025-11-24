import { useState, useEffect, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
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
import { getReturnsFilter } from "@/utils/tableFilters";

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
  const [isMobile, setIsMobile] = useState(false);

  // Callback for ReturnsFilterCard to update returns
  // Returns are stored in Redux, so this callback is mainly for future extensibility
  const handleReturnsUpdate = useCallback(() => {
    // Returns are stored in Redux via dispatch in ReturnsFilterCard
  }, []);

  // Check if we're on mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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

  // Unified returns filter function
  const returnFilterFn = useCallback(getReturnsFilter(), []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Grąžinimai"
        description="Valdykite ir filtruokite grąžinimus"
      />

      {backendFilters && (
        <ReturnsFilterCard
          onReturnsUpdate={handleReturnsUpdate}
          backendFilters={backendFilters}
        />
      )}
      {!backendFilters && <FilterLoadingCard />}

      <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          <Table<Return>
            type={LayoutType.RETURNS}
            data={returns}
            expandedRows={expandedReturns}
            onToggleExpand={toggleReturnExpansion}
            renderExpandedRow={renderExpandedRow}
            filterColumnKey="id"
            filterPlaceholder="Filtruoti grąžinimus..."
            customFilterFn={returnFilterFn}
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
