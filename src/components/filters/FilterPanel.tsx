import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterState, Car } from "@/types";
import { CarFilters } from "@/utils/filterCars";
import { AnalyticsFilters } from "@/views/analytics/AnalyticsFilters";
import { X, Filter, ChevronDown } from "lucide-react";
import { useState } from "react";
import { defaultFilters } from "@/utils/filterParts";
import { LayoutType } from "./type";
import { CarFilters as CarFiltersComponent } from "./components/CarFilters/CarFilters";
import { PartFilters } from "./components/PartFilters/PartFilters";
import { AnalyticsFilters as AnalyticsFiltersComponent } from "./components/AnalyticsFilters/AnalyticsFilters";
import { useAppDispatch } from "@/store/hooks";
import { resetFilters as resetFiltersAction } from "@/store/slices/filtersSlice";

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
  T extends FilterState | CarFilters | AnalyticsFilters
> {
  type: LayoutType;
  filters: T;
  onFiltersChange: (filters: T) => void;
  cars?: Car[];
}

const getFilter = (
  type: LayoutType,
  filters: FilterState | CarFilters | AnalyticsFilters,
  onFiltersChange: (
    updates: Partial<FilterState | CarFilters | AnalyticsFilters>
  ) => void,
  onReset: () => void,
  cars: Car[] = []
) => {
  switch (type) {
    case LayoutType.CAR:
      return (
        <CarFiltersComponent
          filters={filters as CarFilters}
          onFiltersChange={
            onFiltersChange as (updates: Partial<CarFilters>) => void
          }
          onReset={onReset}
          cars={cars}
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
          cars={cars}
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
          cars={cars}
        />
      );
    default:
      return null;
  }
};

export function FilterPanel<
  T extends FilterState | CarFilters | AnalyticsFilters
>({ type, filters, onFiltersChange, cars = [] }: FilterPanelProps<T>) {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(true);

  const updateFilters = (
    updates: Partial<FilterState | CarFilters | AnalyticsFilters>
  ) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const resetFilters = () => {
    if (type === LayoutType.CAR) {
      // Reset to empty filters object (will be fetched from backend)
      onFiltersChange({} as unknown as T);
    } else if (type === LayoutType.ANALYTICS) {
      onFiltersChange(defaultAnalyticsFilters as T);
    } else {
      // For parts filters, dispatch reset action to Redux
      dispatch(resetFiltersAction());
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
            {isOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isOpen && getFilter(type, filters, updateFilters, resetFilters, cars)}
    </Card>
  );
}
