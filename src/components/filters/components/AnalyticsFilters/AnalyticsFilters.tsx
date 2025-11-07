import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { DynamicInputRow } from "@/components/ui/DynamicInputRow";
import { AnalyticsFilters as AnalyticsFiltersType } from "@/views/analytics/AnalyticsFilters";
import { OrderStatus, PartStatus, Car } from "@/types";

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersType;
  onFiltersChange: (updates: Partial<AnalyticsFiltersType>) => void;
  onReset: () => void;
  cars?: Car[];
}

export const AnalyticsFilters = ({
  filters,
  onFiltersChange,
  onReset,
  cars: _cars = [],
}: AnalyticsFiltersProps) => {
  // TODO: Get filter options (brands, categories) from backendFilters
  // For now, using empty arrays until backend provides these filter options
  const uniqueBrands: string[] = [];
  const uniqueCategories: string[] = [];
  const hasActiveFilters =
    filters.dateRange?.from ||
    filters.dateRange?.to ||
    !filters.orderStatus ||
    filters.orderStatus.length !== 1 ||
    filters.orderStatus[0] !== "Delivered" ||
    !filters.partStatus ||
    filters.partStatus.length !== 1 ||
    filters.partStatus[0] !== "Sold" ||
    (filters.category && filters.category.length > 0) ||
    (filters.brand && filters.brand.length > 0) ||
    filters.timePeriod !== "month" ||
    filters.metric !== "revenue";

  return (
    <CardContent className="space-y-4">
      {/* Time Period and Metric Type in a row */}
      <DynamicInputRow gap={4} maxPerRow={2}>
        <div>
          <label className="text-sm font-medium mb-2 block">
            Time Period Grouping
          </label>
          <Select
            value={filters.timePeriod}
            onChange={(e) =>
              onFiltersChange({
                timePeriod: e.target.value as "day" | "week" | "month" | "year",
              })
            }
          >
            <option value="day">By Day</option>
            <option value="week">By Week</option>
            <option value="month">By Month</option>
            <option value="year">By Year</option>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Metric Type</label>
          <Select
            value={filters.metric}
            onChange={(e) =>
              onFiltersChange({
                metric: e.target.value as "revenue" | "count" | "both",
              })
            }
          >
            <option value="revenue">Revenue (EUR)</option>
            <option value="count">Count</option>
            <option value="both">Both</option>
          </Select>
        </div>
      </DynamicInputRow>

      {/* Date Range */}
      <div>
        <label className="text-sm font-medium mb-2 block">Date Range</label>
        <DynamicInputRow gap={2} maxPerRow={2}>
          <Input
            type="date"
            value={
              filters.dateRange?.from
                ? filters.dateRange.from!.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              onFiltersChange({
                dateRange: {
                  ...filters.dateRange,
                  from: e.target.value ? new Date(e.target.value) : undefined,
                },
              } as Partial<AnalyticsFiltersType>)
            }
          />
          <Input
            type="date"
            value={
              filters.dateRange?.to
                ? filters.dateRange.to!.toISOString().split("T")[0]
                : ""
            }
            onChange={(e) =>
              onFiltersChange({
                dateRange: {
                  ...filters.dateRange,
                  to: e.target.value ? new Date(e.target.value) : undefined,
                },
              } as Partial<AnalyticsFiltersType>)
            }
          />
        </DynamicInputRow>
      </div>

      {/* Quick Date Presets */}
      <div>
        <label className="text-sm font-medium mb-2 block">Quick Presets</label>
        <DynamicInputRow gap={2} maxPerRow={4}>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              const now = new Date();
              const thirtyDaysAgo = new Date();
              thirtyDaysAgo.setDate(now.getDate() - 30);
              onFiltersChange({
                dateRange: { from: thirtyDaysAgo, to: now },
              });
            }}
          >
            Last 30 Days
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              const now = new Date();
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(now.getMonth() - 3);
              onFiltersChange({
                dateRange: { from: threeMonthsAgo, to: now },
              });
            }}
          >
            Last 3 Months
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              const now = new Date();
              const sixMonthsAgo = new Date();
              sixMonthsAgo.setMonth(now.getMonth() - 6);
              onFiltersChange({
                dateRange: { from: sixMonthsAgo, to: now },
              });
            }}
          >
            Last 6 Months
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              const now = new Date();
              const oneYearAgo = new Date();
              oneYearAgo.setFullYear(now.getFullYear() - 1);
              onFiltersChange({
                dateRange: { from: oneYearAgo, to: now },
              });
            }}
          >
            Last Year
          </Button>
        </DynamicInputRow>
      </div>

      {/* Multi-select filters in a grid */}
      <DynamicInputRow gap={4}>
        {/* Order Status */}
        <div>
          <label className="text-sm font-medium mb-2 block">Order Status</label>
          <MultiSelectDropdown
            options={
              [
                "Pending",
                "Processing",
                "Shipped",
                "Delivered",
                "Cancelled",
              ] as OrderStatus[]
            }
            selected={filters.orderStatus || []}
            onChange={(selected) => onFiltersChange({ orderStatus: selected })}
            placeholder="Select order status"
          />
        </div>

        {/* Part Status */}
        <div>
          <label className="text-sm font-medium mb-2 block">Part Status</label>
          <MultiSelectDropdown
            options={
              ["In Stock", "Reserved", "Sold", "Returned"] as PartStatus[]
            }
            selected={filters.partStatus || []}
            onChange={(selected) => onFiltersChange({ partStatus: selected })}
            placeholder="Select part status"
          />
        </div>

        {/* Category */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Part Category
          </label>
          <MultiSelectDropdown
            options={uniqueCategories}
            selected={filters.category || []}
            onChange={(selected) => onFiltersChange({ category: selected })}
            placeholder="Select categories"
          />
        </div>

        {/* Brand */}
        <div>
          <label className="text-sm font-medium mb-2 block">Car Brand</label>
          <MultiSelectDropdown
            options={uniqueBrands}
            selected={filters.brand || []}
            onChange={(selected) => onFiltersChange({ brand: selected })}
            placeholder="Select brands"
          />
        </div>
      </DynamicInputRow>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <Button variant="outline" className="w-full" onClick={onReset}>
          Reset Filters
        </Button>
      )}
    </CardContent>
  );
};
