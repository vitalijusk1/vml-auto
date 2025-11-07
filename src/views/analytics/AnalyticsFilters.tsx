import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { X, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectParts } from "@/store/selectors";
import { OrderStatus, PartStatus, Car } from "@/types";

export interface AnalyticsFilters {
  dateRange: {
    from?: Date;
    to?: Date;
  };
  timePeriod: "day" | "week" | "month" | "year";
  orderStatus: OrderStatus[];
  partStatus: PartStatus[];
  category: string[];
  brand: string[];
  metric: "revenue" | "count" | "both";
}

const defaultFilters: AnalyticsFilters = {
  dateRange: {},
  timePeriod: "month",
  orderStatus: ["Delivered"],
  partStatus: ["Sold"],
  category: [],
  brand: [],
  metric: "revenue",
};

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  cars?: Car[];
}

export function AnalyticsFiltersPanel({
  filters,
  onFiltersChange,
  cars = [],
}: AnalyticsFiltersProps) {
  const [isOpen, setIsOpen] = useState(true);
  const parts = useAppSelector(selectParts);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(parts.map((p) => p.category))).sort();
  }, [parts]);

  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.brand))).sort();
  }, [cars]);

  const updateFilters = (updates: Partial<AnalyticsFilters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const resetFilters = () => {
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters =
    filters.dateRange.from ||
    filters.dateRange.to ||
    filters.orderStatus.length !== 1 ||
    filters.orderStatus[0] !== "Delivered" ||
    filters.partStatus.length !== 1 ||
    filters.partStatus[0] !== "Sold" ||
    filters.category.length > 0 ||
    filters.brand.length > 0 ||
    filters.timePeriod !== "month" ||
    filters.metric !== "revenue";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analytics Filters
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
      {isOpen && (
        <CardContent className="space-y-4">
          {/* Time Period and Metric Type in a row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Time Period Grouping
              </label>
              <Select
                value={filters.timePeriod}
                onChange={(e) =>
                  updateFilters({
                    timePeriod: e.target.value as
                      | "day"
                      | "week"
                      | "month"
                      | "year",
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
              <label className="text-sm font-medium mb-2 block">
                Metric Type
              </label>
              <Select
                value={filters.metric}
                onChange={(e) =>
                  updateFilters({
                    metric: e.target.value as "revenue" | "count" | "both",
                  })
                }
              >
                <option value="revenue">Revenue (EUR)</option>
                <option value="count">Count</option>
                <option value="both">Both</option>
              </Select>
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                type="date"
                value={
                  filters.dateRange.from
                    ? filters.dateRange.from.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  updateFilters({
                    dateRange: {
                      ...filters.dateRange,
                      from: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    },
                  })
                }
              />
              <Input
                type="date"
                value={
                  filters.dateRange.to
                    ? filters.dateRange.to.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  updateFilters({
                    dateRange: {
                      ...filters.dateRange,
                      to: e.target.value ? new Date(e.target.value) : undefined,
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Quick Date Presets */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const thirtyDaysAgo = new Date();
                  thirtyDaysAgo.setDate(now.getDate() - 30);
                  updateFilters({
                    dateRange: { from: thirtyDaysAgo, to: now },
                  });
                }}
              >
                Last 30 Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const threeMonthsAgo = new Date();
                  threeMonthsAgo.setMonth(now.getMonth() - 3);
                  updateFilters({
                    dateRange: { from: threeMonthsAgo, to: now },
                  });
                }}
              >
                Last 3 Months
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const sixMonthsAgo = new Date();
                  sixMonthsAgo.setMonth(now.getMonth() - 6);
                  updateFilters({
                    dateRange: { from: sixMonthsAgo, to: now },
                  });
                }}
              >
                Last 6 Months
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const now = new Date();
                  const oneYearAgo = new Date();
                  oneYearAgo.setFullYear(now.getFullYear() - 1);
                  updateFilters({
                    dateRange: { from: oneYearAgo, to: now },
                  });
                }}
              >
                Last Year
              </Button>
            </div>
          </div>

          {/* Multi-select filters in a grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Order Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Order Status
              </label>
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
                selected={filters.orderStatus}
                onChange={(selected) =>
                  updateFilters({ orderStatus: selected })
                }
                placeholder="Select order status..."
              />
            </div>

            {/* Part Status */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Part Status
              </label>
              <MultiSelectDropdown
                options={
                  ["In Stock", "Reserved", "Sold", "Returned"] as PartStatus[]
                }
                selected={filters.partStatus}
                onChange={(selected) => updateFilters({ partStatus: selected })}
                placeholder="Select part status..."
              />
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Part Category
              </label>
              <MultiSelectDropdown
                options={uniqueCategories}
                selected={filters.category}
                onChange={(selected) => updateFilters({ category: selected })}
                placeholder="Select categories..."
              />
            </div>

            {/* Brand */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Car Brand
              </label>
              <MultiSelectDropdown
                options={uniqueBrands}
                selected={filters.brand}
                onChange={(selected) => updateFilters({ brand: selected })}
                placeholder="Select brands..."
              />
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button variant="outline" className="w-full" onClick={resetFilters}>
              Reset Filters
            </Button>
          )}
        </CardContent>
      )}
    </Card>
  );
}
