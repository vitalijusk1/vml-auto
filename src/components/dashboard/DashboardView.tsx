import { useAppSelector } from "@/store/hooks";
import { selectMetrics } from "@/store/selectors";
import { MetricsCards } from "./MetricsCards";
import { TopPerformersSection } from "./TopPerformersSection";
import { PartsInventoryTable } from "../parts/PartsInventoryTable";
import { FilterPanel } from "../filters/FilterPanel";
import { StaleInventoryAlert } from "./StaleInventoryAlert";

export function DashboardView() {
  const metrics = useAppSelector(selectMetrics);

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterPanel />
        </div>
        <div className="lg:col-span-3">
          <TopPerformersSection />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Parts Inventory</h2>
        <PartsInventoryTable />
      </div>
    </div>
  );
}
