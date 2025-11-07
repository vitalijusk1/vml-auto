import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectPartsPagination } from "@/store/selectors";
import { setPartsPagination } from "@/store/slices/uiSlice";
import { getParts, getFilters } from "@/api/parts";
import { Part } from "@/types";
import { FilterPanel } from "../../components/filters/FilterPanel";
import { Table } from "../../components/tables/Table";
import { defaultFilters } from "@/utils/filterParts";
import { FilterState } from "@/types";
import { CarFilters } from "@/utils/filterCars";

export function PartsView() {
  const dispatch = useAppDispatch();
  const savedPagination = useAppSelector(selectPartsPagination);
  const [parts, setParts] = useState<Part[]>([]);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [backendFilters, setBackendFilters] = useState<CarFilters | null>(null);
  const [pagination, setPagination] = useState(
    savedPagination || {
      current_page: 1,
      per_page: 15,
      total: 0,
      last_page: 1,
    }
  );
  // Use empty array for cars since parts are fetched separately
  const cars: never[] = [];

  // Fetch parts and filters when entering this view or when pagination changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch filters from backend
        if (backendFilters === null) {
          const filtersData = await getFilters();
          setBackendFilters(filtersData);
        }

        // Fetch parts
        const response = await getParts({
          page: pagination.current_page,
          per_page: pagination.per_page,
          // TODO: Add filter parameters when backend filtering is ready
        });
        setParts(response.parts);
        setPagination(response.pagination);
        // Save pagination to Redux
        dispatch(setPartsPagination(response.pagination));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dispatch, pagination.current_page, pagination.per_page, backendFilters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Parts Inventory</h1>
        <p className="text-muted-foreground">
          Manage and filter your parts inventory
        </p>
      </div>

      <FilterPanel
        type="parts"
        filters={filters}
        onFiltersChange={setFilters}
        cars={cars}
        backendFilters={backendFilters}
      />

      <Table
        type="parts"
        data={parts}
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
      />
    </div>
  );
}
