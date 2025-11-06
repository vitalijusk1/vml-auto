import { useState, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectMetrics, selectParts, selectCars } from "@/store/selectors";
import { MetricsCards } from "./MetricsCards";
import { TopPerformersSection } from "./TopPerformersSection";
import { PartsInventoryTable } from "../parts/PartsInventoryTable";
import { UnifiedFilterPanel } from "../filters/UnifiedFilterPanel";
import { StaleInventoryAlert } from "./StaleInventoryAlert";
import { filterParts, defaultFilters } from "@/utils/filterParts";
import { FilterState } from "@/types";

export function DashboardView() {
  const metrics = useAppSelector(selectMetrics);
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
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Monitor your inventory and sales performance
        </p>
      </div>

      <MetricsCards metrics={metrics} />

      <StaleInventoryAlert />

      <UnifiedFilterPanel
        type="parts"
        filters={filters}
        onFiltersChange={setFilters}
      />

      <TopPerformersSection />

      <div>
        <h2 className="text-2xl font-semibold mb-4">Parts Inventory</h2>
        <PartsInventoryTable parts={filteredParts} />
      </div>
    </div>
  );
}
