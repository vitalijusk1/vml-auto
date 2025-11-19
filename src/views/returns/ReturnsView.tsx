import { useState, useEffect, useMemo, useCallback } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectReturns,
  selectBackendFilters,
  selectFilters,
} from "@/store/selectors";
import { FilterState, Return } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { setReturns } from "@/store/slices/dataSlice";
import { setFilters } from "@/store/slices/filtersSlice";
import { getReturns, filterStateToReturnsQueryParams } from "@/api/returns";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { LayoutType } from "@/components/filters/type";
import { Table } from "@/components/tables/Table";
import { PhotoGalleryModal } from "@/components/modals/PhotoGalleryModal";
import { renderReturnExpandedContent } from "@/components/tables/components/ReturnTableColumns";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { FilterLoadingCard } from "@/components/ui/FilterLoadingCard";

export function ReturnsView() {
  const dispatch = useAppDispatch();
  const returns = useAppSelector(selectReturns);
  const backendFilters = useAppSelector(selectBackendFilters);
  const filters = useAppSelector(selectFilters);
  const [expandedReturns, setExpandedReturns] = useState<Set<string>>(
    new Set()
  );
  const [isLoadingReturns, setIsLoadingReturns] = useState(false);
  const [selectedPhotoGallery, setSelectedPhotoGallery] = useState<{
    photos: string[];
    title: string;
  } | null>(null);

  // Serialize filters to detect changes properly (React does shallow comparison)
  const filtersKey = useMemo(() => {
    return JSON.stringify(filters);
  }, [filters]);

  // Fetch returns when filters change
  useEffect(() => {
    const fetchData = async () => {
      // Wait for backendFilters to load before fetching with filters
      // This prevents calling the API with invalid parameters
      if (!backendFilters) {
        return;
      }

      setIsLoadingReturns(true);
      try {
        console.log("Fetching returns...");

        // Convert filters to query params
        const queryParams = filterStateToReturnsQueryParams(
          filters,
          backendFilters
        );

        // Fetch returns with filters
        const response = await getReturns(queryParams);

        console.log("Returns response:", response);

        // getReturns returns Return[], so response is already an array
        const returnsArray = Array.isArray(response) ? response : [];

        dispatch(setReturns(returnsArray));
      } catch (error) {
        console.error("Error fetching returns:", error);
        // Set empty array on error so table still shows
        dispatch(setReturns([]));
      } finally {
        setIsLoadingReturns(false);
      }
    };

    fetchData();
  }, [dispatch, filtersKey, backendFilters]);

  // Always expand all returns by default when returns change
  useEffect(() => {
    if (returns.length > 0) {
      setExpandedReturns(new Set(returns.map((r) => r.id)));
    }
  }, [returns]);

  const toggleReturnExpansion = (returnId: string) => {
    setExpandedReturns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(returnId)) {
        newSet.delete(returnId);
      } else {
        newSet.add(returnId);
      }
      return newSet;
    });
  };

  const handlePhotoClick = (photos: string[], title: string) => {
    setSelectedPhotoGallery({ photos, title });
  };

  // Custom filter function for returns (filters across multiple fields)
  const returnFilterFn = useCallback(
    (returns: Return[], filterValue: string): Return[] => {
      if (!filterValue.trim()) {
        return returns;
      }
      const filterLower = filterValue.toLowerCase();
      return returns.filter((returnItem) => {
        return (
          returnItem.id.toLowerCase().includes(filterLower) ||
          returnItem.orderId.toLowerCase().includes(filterLower) ||
          returnItem.customer?.name?.toLowerCase().includes(filterLower) ||
          returnItem.customer?.country?.toLowerCase().includes(filterLower) ||
          returnItem.items.some((item) =>
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
        title="Grąžinimai"
        description="Valdykite ir filtruokite grąžinimus"
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
          isLoading={isLoadingReturns}
          hideCategoriesAndWheels={true}
          hideTopDetailsFilter={true}
          showOrderIdFilter={false}
        />
      )}
      {!backendFilters && <FilterLoadingCard />}

      <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          {isLoadingReturns ? (
            <LoadingState message="Kraunami grąžinimai..." />
          ) : (
            <Table<Return>
              type={LayoutType.RETURNS}
              data={returns}
              expandedRows={expandedReturns}
              onToggleExpand={toggleReturnExpansion}
              renderExpandedRow={(returnItem) =>
                renderReturnExpandedContent(returnItem, handlePhotoClick)
              }
              filterColumnKey="id"
              filterPlaceholder="Filtruoti grąžinimus..."
              customFilterFn={returnFilterFn}
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
