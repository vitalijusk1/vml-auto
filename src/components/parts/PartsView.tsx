import { useState, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectParts, selectCars } from "@/store/selectors";
import { UnifiedFilterPanel } from "../filters/UnifiedFilterPanel";
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

      <UnifiedFilterPanel
        type="parts"
        filters={filters}
        onFiltersChange={setFilters}
      />

      <PartsInventoryTable parts={filteredParts} />
    </div>
  );
}
