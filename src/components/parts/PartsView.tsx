import { useState, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectParts, selectCars } from "@/store/selectors";
import { FilterPanel } from "../filters/FilterPanel";
import { PartsInventoryTable } from "./PartsInventoryTable";
import { filterParts, defaultFilters } from "@/utils/filterParts";
import { FilterState } from "@/types";

export function PartsView() {
  const parts = useAppSelector(selectParts);
  const cars = useAppSelector(selectCars);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  const filteredParts = useMemo(
    () => filterParts(parts, filters, cars),
    [parts, filters, cars]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Parts Inventory</h1>
        <p className="text-muted-foreground">
          Manage and filter your parts inventory
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterPanel filters={filters} onFiltersChange={setFilters} />
        </div>
        <div className="lg:col-span-3">
          <PartsInventoryTable parts={filteredParts} />
        </div>
      </div>
    </div>
  );
}
