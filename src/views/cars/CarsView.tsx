import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectCarsPagination } from "@/store/selectors";
import { setCarsPagination } from "@/store/slices/uiSlice";
import { getCars, getFilters } from "@/api/cars";
import { Car } from "@/types";
import { FilterPanel } from "../../components/filters/FilterPanel";
import { CarFilters } from "@/utils/filterCars";
import { Table } from "../../components/tables/Table";

export function CarsView() {
  const dispatch = useAppDispatch();
  const savedPagination = useAppSelector(selectCarsPagination);
  const [cars, setCars] = useState<Car[]>([]);
  const [filters, setFilters] = useState<CarFilters | null>(null);
  const [pagination, setPagination] = useState(
    savedPagination || {
      current_page: 1,
      per_page: 15,
      total: 0,
      last_page: 1,
    }
  );

  // Fetch cars and filters when entering this view or when filters/pagination change
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch filters from backend
        if (filters === null) {
          const filtersData = await getFilters();
          setFilters(filtersData);
        }

        // Fetch cars
        const response = await getCars({
          page: pagination.current_page,
          per_page: pagination.per_page,
          // TODO: Add filter parameters when backend filtering is ready
          // ...filters
        });
        setCars(response.cars);
        setPagination(response.pagination);
        // Save pagination to Redux
        dispatch(setCarsPagination(response.pagination));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [dispatch, pagination.current_page, pagination.per_page, filters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Car Inventory</h1>
        <p className="text-muted-foreground">
          Manage your car inventory and parts availability
        </p>
      </div>

      {filters && (
        <FilterPanel
          type="car"
          filters={filters}
          onFiltersChange={setFilters}
          cars={cars}
        />
      )}

      <Table
        type="car"
        data={cars}
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
