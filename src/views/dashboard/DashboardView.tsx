import { useState, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectMetrics, selectParts } from "@/store/selectors";
import { MetricsCards } from "./MetricsCards";
import { TopPerformersSection } from "./TopPerformersSection";
import { Table } from "../../components/tables/Table";
import { FilterPanel } from "../../components/filters/FilterPanel";
import { StaleInventoryAlert } from "./StaleInventoryAlert";
import { filterParts, defaultFilters } from "@/utils/filterParts";
import { FilterState } from "@/types";

export function DashboardView() {
  const metrics = useAppSelector(selectMetrics);
  const parts = useAppSelector(selectParts);
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  // Use empty array for cars since parts are mock data
  const cars: never[] = [];

  const filteredParts = useMemo(
    () => filterParts(parts, filters, cars),
    [parts, filters, cars]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Skydelis</h1>
        <p className="text-muted-foreground">
          Stebėkite savo inventorių ir pardavimų rezultatus
        </p>
      </div>

      <MetricsCards metrics={metrics} />

      <StaleInventoryAlert />

      <FilterPanel
        type="parts"
        filters={filters}
        onFiltersChange={setFilters}
        cars={cars}
      />

      <TopPerformersSection />

      <Table type="parts" data={filteredParts} title="Sandėlys" />
    </div>
  );
}
