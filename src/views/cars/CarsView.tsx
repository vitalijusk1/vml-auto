import { useState, useMemo, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectCars } from "@/store/selectors";
import { FilterPanel } from "../../components/filters/FilterPanel";
import {
  filterCars,
  defaultCarFilters,
  CarFilterState,
} from "@/utils/filterCars";
import { Table } from "../../components/tables/Table";
import { getCars } from "@/api/cars";
import { Car } from "@/types";

export function CarsView() {
  const cars = useAppSelector(selectCars);
  const [filters, setFilters] = useState<CarFilterState>(defaultCarFilters);
  const [fetchedCars, setFetchedCars] = useState<Car[]>([]);

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await getCars();
        console.log("Fetched cars from API:", response);
        setFetchedCars(response);
      } catch (error) {
        console.error("Error fetching cars:", error);
      }
    };

    fetchCars();
  }, []);

  // Use fetched cars if available, otherwise fall back to Redux store
  const carsToDisplay = fetchedCars.length > 0 ? fetchedCars : cars;

  const filteredCars = useMemo(
    () => filterCars(carsToDisplay, filters),
    [carsToDisplay, filters]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Car Inventory</h1>
        <p className="text-muted-foreground">
          Manage your car inventory and parts availability
        </p>
      </div>

      <FilterPanel type="car" filters={filters} onFiltersChange={setFilters} />

      <Table type="car" data={filteredCars} />
    </div>
  );
}
