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
import { store } from "@/store";

// Separate component that subscribes to filters - this isolates re-renders
// Only this component re-renders when filters change, not ReturnsView
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

export function ReturnsView() {
  const dispatch = useAppDispatch();
  const returns = useAppSelector(selectReturns);
  const backendFilters = useAppSelector(selectBackendFilters);

  // Use ref to get latest filters without subscribing (prevents re-renders)
  const filtersRef = useRef<FilterState>(store.getState().filters);
  const filtersKeyRef = useRef<string>(
    JSON.stringify(store.getState().filters)
  );
  const backendFiltersRef = useRef(backendFilters);
  const dispatchRef = useRef(dispatch);
  const isLoadingRef = useRef(false);
  const setIsLoadingReturnsRef = useRef<((loading: boolean) => void) | null>(
    null
  );

  const [expandedReturns, setExpandedReturns] = useState<Set<string>>(
    new Set()
  );
  const [isLoadingReturns, setIsLoadingReturns] = useState(false);
  const [selectedPhotoGallery, setSelectedPhotoGallery] = useState<{
    photos: string[];
    title: string;
  } | null>(null);

  // Keep refs in sync
  useEffect(() => {
    backendFiltersRef.current = backendFilters;
  }, [backendFilters]);

  useEffect(() => {
    dispatchRef.current = dispatch;
  }, [dispatch]);

  useEffect(() => {
    setIsLoadingReturnsRef.current = setIsLoadingReturns;
  }, []);

  // Note: Filters are fetched in App.tsx on initial load, no need to fetch here

  // Fetch function that updates loading state only when actually needed
  const fetchReturns = useCallback(async (skipLoadingState = false) => {
    if (!backendFiltersRef.current) {
      return;
    }

    // Only update loading state if not already loading and not skipping (prevents unnecessary re-renders)
    if (
      !skipLoadingState &&
      !isLoadingRef.current &&
      setIsLoadingReturnsRef.current
    ) {
      isLoadingRef.current = true;
      // Use setTimeout to defer loading state update, allowing filter change to complete without re-render
      setTimeout(() => {
        if (setIsLoadingReturnsRef.current) {
          setIsLoadingReturnsRef.current(true);
        }
      }, 0);
    }

    try {
      console.log("Fetching returns...");

      // Convert filters to query params
      // Use filtersRef.current to get latest filters without causing re-renders
      const queryParams = filterStateToReturnsQueryParams(
        filtersRef.current,
        backendFiltersRef.current
      );

      // Fetch returns with filters
      const response = await getReturns(queryParams);

      console.log("Returns response:", response);

      // getReturns returns Return[], so response is already an array
      const returnsArray = Array.isArray(response) ? response : [];

      dispatchRef.current(setReturns(returnsArray));
    } catch (error) {
      console.error("Error fetching returns:", error);
      // Set empty array on error so table still shows
      dispatchRef.current(setReturns([]));
    } finally {
      if (!skipLoadingState && setIsLoadingReturnsRef.current) {
        isLoadingRef.current = false;
        setIsLoadingReturnsRef.current(false);
      }
    }
  }, []);

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
    if (backendFilters && returns.length === 0) {
      // Only fetch if we don't have returns yet (initial load)
      fetchReturns(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendFilters]); // Run when backendFilters become available

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

  const handleFiltersChange = useCallback(
    (newFilters: FilterState) => {
      dispatch(setFilters(newFilters));
    },
    [dispatch]
  );

  const handleFilter = useCallback(() => {
    // Fetch returns with current filters
    fetchReturns(false); // false = show loading state
  }, [fetchReturns]);

  const renderExpandedRow = useCallback(
    (returnItem: Return) =>
      renderReturnExpandedContent(returnItem, handlePhotoClick),
    [handlePhotoClick]
  );

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
        <FilterPanelContainer
          onFiltersChange={handleFiltersChange}
          onFilter={handleFilter}
          isLoading={isLoadingReturns}
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
              renderExpandedRow={renderExpandedRow}
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
