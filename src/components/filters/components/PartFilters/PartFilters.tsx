import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { FilterState, PartStatus, BodyType } from "@/types";
import { useFilters } from "../useFilters";

interface PartFiltersProps {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
}

export const PartFilters = ({
  filters,
  onFiltersChange,
  onReset,
}: PartFiltersProps) => {
  const {
    uniqueBrands,
    uniqueModels,
    uniqueYears,
    uniqueBodyTypes,
    uniquePartTypes,
  } = useFilters(filters);

  return (
    <CardContent className="space-y-4">
      {/* Multi-select filters in a grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Brand */}
        <div>
          <label className="text-sm font-medium mb-2 block">Brand</label>
          <MultiSelectDropdown
            options={uniqueBrands}
            selected={filters.carBrand || []}
            onChange={(selected) => onFiltersChange({ carBrand: selected })}
            placeholder="Select brands..."
          />
        </div>

        {/* Model */}
        <div>
          <label className="text-sm font-medium mb-2 block">Model</label>
          <MultiSelectDropdown
            options={uniqueModels}
            selected={filters.carModel || []}
            onChange={(selected) => onFiltersChange({ carModel: selected })}
            placeholder="Select models..."
          />
        </div>

        {/* Body Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Body Type</label>
          <MultiSelectDropdown
            options={uniqueBodyTypes as BodyType[]}
            selected={filters.bodyType || []}
            onChange={(selected) => onFiltersChange({ bodyType: selected })}
            placeholder="Select body types..."
          />
        </div>

        {/* Part Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Part Type</label>
          <MultiSelectDropdown
            options={uniquePartTypes}
            selected={filters.partType || []}
            onChange={(selected) => onFiltersChange({ partType: selected })}
            placeholder="Select part types..."
          />
        </div>
      </div>

      {/* Year Range and Price Range in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Year Range */}
        <div>
          <label className="text-sm font-medium mb-2 block">Year Range</label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min Year"
              value={filters.yearRange.min || ""}
              onChange={(e) =>
                onFiltersChange({
                  yearRange: {
                    ...filters.yearRange,
                    min: e.target.value ? parseInt(e.target.value) : undefined,
                  },
                })
              }
            />
            <Input
              type="number"
              placeholder="Max Year"
              value={filters.yearRange.max || ""}
              onChange={(e) =>
                onFiltersChange({
                  yearRange: {
                    ...filters.yearRange,
                    max: e.target.value ? parseInt(e.target.value) : undefined,
                  },
                })
              }
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Price Range (EUR)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceRange.min || ""}
              onChange={(e) =>
                onFiltersChange({
                  priceRange: {
                    ...filters.priceRange,
                    min: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  },
                })
              }
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceRange.max || ""}
              onChange={(e) =>
                onFiltersChange({
                  priceRange: {
                    ...filters.priceRange,
                    max: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  },
                })
              }
            />
          </div>
        </div>
      </div>

      {/* Status and Is Stale in a row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status */}
        <div>
          <label className="text-sm font-medium mb-2 block">Status</label>
          <Select
            value={filters.status}
            onChange={(e) =>
              onFiltersChange({
                status: e.target.value as PartStatus | "All",
              })
            }
          >
            <option value="All">All</option>
            <option value="In Stock">In Stock</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
            <option value="Returned">Returned</option>
          </Select>
        </div>

        {/* Stale */}
        <div>
          <label className="text-sm font-medium mb-2 block">Stale</label>
          <Select
            value={filters.staleMonths?.toString() || "All"}
            onChange={(e) =>
              onFiltersChange({
                staleMonths:
                  e.target.value === "All"
                    ? undefined
                    : parseInt(e.target.value),
              })
            }
          >
            <option value="All">All</option>
            <option value="1">1 month</option>
            <option value="2">2 months</option>
            <option value="3">3 months</option>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
          </Select>
        </div>
      </div>

      {/* Reset Filters */}
      <Button variant="outline" className="w-full" onClick={onReset}>
        Clear All Filters
      </Button>
    </CardContent>
  );
};
