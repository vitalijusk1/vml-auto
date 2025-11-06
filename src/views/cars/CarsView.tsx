import { useState, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectCars } from "@/store/selectors";
import { FilterPanel } from "../../components/filters/FilterPanel";
import {
  filterCars,
  defaultCarFilters,
  CarFilterState,
} from "@/utils/filterCars";
import { Table } from "../../components/tables/Table";

export function CarsView() {
  const cars = useAppSelector(selectCars);
  const [filters, setFilters] = useState<CarFilterState>(defaultCarFilters);

  const filteredCars = useMemo(
    () => filterCars(cars, filters),
    [cars, filters]
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
