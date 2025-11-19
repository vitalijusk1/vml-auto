import { useState, useEffect, useMemo, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectPartsPagination,
  selectBackendFilters,
  selectFilters,
} from "@/store/selectors";
import { setPartsPagination } from "@/store/slices/uiSlice";
import { setFilters } from "@/store/slices/filtersSlice";
import { getParts, filterStateToQueryParams } from "@/api/parts";
import { Part } from "@/types";
import { FilterPanel } from "../../components/filters/FilterPanel";
import { Table } from "../../components/tables/Table";
import { PageHeader } from "@/components/ui/PageHeader";

export function PartsView() {
  const dispatch = useAppDispatch();
  const savedPagination = useAppSelector(selectPartsPagination);
  const backendFilters = useAppSelector(selectBackendFilters);
  const filters = useAppSelector(selectFilters);
  const [parts, setParts] = useState<Part[]>([]);
  const [pagination, setPagination] = useState(
    savedPagination || {
      current_page: 1,
      per_page: 15,
      total: 0,
      last_page: 1,
    }
  );
  const [topDetailsFilter, setTopDetailsFilter] = useState<string>("be-filtro");
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  // Use empty array for cars since parts are fetched separately
  const cars: never[] = [];

  // Note: All filtering is handled by the backend
  // The parts returned from the API are already filtered based on the current filters
  const filteredParts = useMemo(() => {
    return parts;
  }, [parts]);

  // Note: Filters are fetched in App.tsx on initial load, no need to fetch here

  // Function to fetch parts based on current filters
  const fetchParts = async () => {
    if (!backendFilters) {
      return;
    }

    setIsLoadingParts(true);
    try {
      // Convert filters to query parameters
      const queryParams = filterStateToQueryParams(
        filters,
        {
          page: pagination.current_page,
          per_page: pagination.per_page,
        },
        backendFilters
      );

      // Fetch parts with filters
      const response = await getParts(queryParams);
      setParts(response.parts);
      setPagination(response.pagination);
      // Save pagination to Redux
      dispatch(setPartsPagination(response.pagination));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoadingParts(false);
    }
  };

  // Fetch initial data on mount or when backendFilters become available
  useEffect(() => {
    if (backendFilters && parts.length === 0) {
      // Only fetch if we don't have parts yet (initial load)
      fetchParts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendFilters]); // Run when backendFilters become available

  // Fetch parts when pagination changes (but not when filters change)
  // Only fetch if we already have parts (meaning filters were applied)
  useEffect(() => {
    // Only fetch if we already have parts (meaning filters were applied)
    // This handles pagination changes after initial filter
    if (parts.length > 0 || pagination.current_page > 1) {
      fetchParts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current_page, pagination.per_page]);

  // Handle filter button click
  const handleFilter = () => {
    // Reset to page 1 when filtering
    setPagination((prev) => ({ ...prev, current_page: 1 }));
    // Fetch parts with current filters
    fetchParts();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sandėlys"
        description="Valdykite ir filtruokite sandėlio inventorių"
      />

      <FilterPanel
        type="parts"
        filters={filters}
        onFiltersChange={(newFilters) => {
          dispatch(setFilters(newFilters));
        }}
        cars={cars}
        onTopDetailsFilterChange={setTopDetailsFilter}
        onFilter={handleFilter}
        isLoading={isLoadingParts}
      />

      <Table
        type="parts"
        data={filteredParts}
        serverPagination={pagination}
        onPageChange={(page) => {
          setPagination((prev) => ({ ...prev, current_page: page }));
        }}
        onPageSizeChange={(pageSize) => {
          setPagination((prev) => ({
            ...prev,
            per_page: pageSize,
            current_page: 1,
          }));
        }}
        topDetailsFilter={topDetailsFilter}
      />
    </div>
  );
}
