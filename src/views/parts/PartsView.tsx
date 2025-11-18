import { useState, useEffect, useMemo } from "react";
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
  // Use empty array for cars since parts are fetched separately
  const cars: never[] = [];

  // Note: All filtering is handled by the backend
  // The parts returned from the API are already filtered based on the current filters
  const filteredParts = useMemo(() => {
    return parts;
  }, [parts]);

  // Note: Filters are fetched in App.tsx on initial load, no need to fetch here

  // Serialize filters to detect changes properly (React does shallow comparison)
  const filtersKey = useMemo(() => {
    return JSON.stringify(filters);
  }, [filters]);

  // Fetch parts when pagination or filters change
  useEffect(() => {
    const fetchData = async () => {
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
      }
    };

    fetchData();
  }, [dispatch, pagination.current_page, pagination.per_page, filtersKey]);

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
          // Reset to page 1 when filters change
          setPagination((prev) => ({ ...prev, current_page: 1 }));
        }}
        cars={cars}
        onTopDetailsFilterChange={setTopDetailsFilter}
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
