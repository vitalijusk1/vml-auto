import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterState } from "@/types";
import { CarFilterState } from "@/utils/filterCars";
import { AnalyticsFilters } from "@/views/analytics/AnalyticsFilters";
import { X, Filter } from "lucide-react";
import { useState } from "react";
import { defaultFilters } from "@/utils/filterParts";
import { defaultCarFilters } from "@/utils/filterCars";
import { LayoutType } from "./type";
import { CarFilters } from "./components/CarFilters/CarFilters";
import { PartFilters } from "./components/PartFilters/PartFilters";
import { AnalyticsFilters as AnalyticsFiltersComponent } from "./components/AnalyticsFilters/AnalyticsFilters";

const defaultAnalyticsFilters: AnalyticsFilters = {
  dateRange: {},
  timePeriod: "month",
  orderStatus: ["Delivered"],
  partStatus: ["Sold"],
  category: [],
  brand: [],
  metric: "revenue",
};

interface FilterPanelProps<
  T extends FilterState | CarFilterState | AnalyticsFilters
> {
  type: LayoutType;
  filters: T;
  onFiltersChange: (filters: T) => void;
}

const getFilter = (
  type: LayoutType,
  filters: FilterState | CarFilterState | AnalyticsFilters,
  onFiltersChange: (
    updates: Partial<FilterState | CarFilterState | AnalyticsFilters>
  ) => void,
  onReset: () => void
) => {
  switch (type) {
    case LayoutType.CAR:
      return (
        <CarFilters
          filters={filters as CarFilterState}
          onFiltersChange={
            onFiltersChange as (updates: Partial<CarFilterState>) => void
          }
          onReset={onReset}
        />
      );
    case LayoutType.PARTS:
      return (
        <PartFilters
          filters={filters as FilterState}
          onFiltersChange={
            onFiltersChange as (updates: Partial<FilterState>) => void
          }
          onReset={onReset}
        />
      );
    case LayoutType.ANALYTICS:
      return (
        <AnalyticsFiltersComponent
          filters={filters as AnalyticsFilters}
          onFiltersChange={
            onFiltersChange as (updates: Partial<AnalyticsFilters>) => void
          }
          onReset={onReset}
        />
      );
    default:
      return null;
  }
};

export function FilterPanel<
  T extends FilterState | CarFilterState | AnalyticsFilters
>({ type, filters, onFiltersChange }: FilterPanelProps<T>) {
  const [isOpen, setIsOpen] = useState(true);

  const updateFilters = (
    updates: Partial<FilterState | CarFilterState | AnalyticsFilters>
  ) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const resetFilters = () => {
    if (type === LayoutType.CAR) {
      onFiltersChange(defaultCarFilters as T);
    } else if (type === LayoutType.ANALYTICS) {
      onFiltersChange(defaultAnalyticsFilters as T);
    } else {
      onFiltersChange(defaultFilters as T);
    }
  };

  // Get title based on type
  const title = type === "analytics" ? "Analytics Filters" : "Filters";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {title}
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      {isOpen && getFilter(type, filters, updateFilters, resetFilters)}
    </Card>
  );
}
