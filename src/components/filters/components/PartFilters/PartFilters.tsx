import { useState, useMemo } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { DynamicInputRow } from "@/components/ui/DynamicInputRow";
import { FilterState, PartStatus, BodyType, Car } from "@/types";
import { CategorySection } from "../CategorySection/CategorySection";
import { CarFilters } from "@/utils/filterCars";

interface PartFiltersProps {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  cars?: Car[];
  backendFilters?: CarFilters | null;
}

export const PartFilters = ({
  filters,
  onFiltersChange,
  onReset,
  cars: _cars = [],
  backendFilters,
}: PartFiltersProps) => {
  // TODO: Get filter options (brands, models, body types, part types) from backendFilters
  // For now, using empty arrays until backend provides these filter options
  const uniqueBrands: string[] = [];
  const uniqueModels: string[] = [];
  const uniqueBodyTypes: BodyType[] = [];
  const uniquePartTypes: string[] = [];

  // Track selected category IDs
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Handle category selection
  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Extract categories from backend filters
  const categories = useMemo(() => {
    if (
      backendFilters?.categories &&
      Array.isArray(backendFilters.categories)
    ) {
      return backendFilters.categories;
    }
    return [];
  }, [backendFilters]);

  return (
    <CardContent className="space-y-6">
      {/* Categories Section */}
      {backendFilters === null ? (
        <p className="text-muted-foreground text-sm">Loading filters...</p>
      ) : (
        <CategorySection
          categories={categories}
          selectedCategories={selectedCategories}
          onCategoryToggle={handleCategoryToggle}
        />
      )}

      {/* Multi-select filters in a grid */}
      <DynamicInputRow gap={4}>
        {/* Brand */}
        <div>
          <label className="text-sm font-medium mb-2 block">Brand</label>
          <MultiSelectDropdown
            options={uniqueBrands}
            selected={filters.carBrand || []}
            onChange={(selected) => onFiltersChange({ carBrand: selected })}
            placeholder="Select brands"
          />
        </div>

        {/* Model */}
        <div>
          <label className="text-sm font-medium mb-2 block">Model</label>
          <MultiSelectDropdown
            options={uniqueModels}
            selected={filters.carModel || []}
            onChange={(selected) => onFiltersChange({ carModel: selected })}
            placeholder="Select models"
          />
        </div>

        {/* Body Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Body Type</label>
          <MultiSelectDropdown
            options={uniqueBodyTypes as BodyType[]}
            selected={filters.bodyType || []}
            onChange={(selected) => onFiltersChange({ bodyType: selected })}
            placeholder="Select body types"
          />
        </div>

        {/* Part Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Part Type</label>
          <MultiSelectDropdown
            options={uniquePartTypes}
            selected={filters.partType || []}
            onChange={(selected) => onFiltersChange({ partType: selected })}
            placeholder="Select part types"
          />
        </div>
      </DynamicInputRow>

      {/* Year Range and Price Range in a row */}
      <DynamicInputRow gap={4} maxPerRow={2}>
        {/* Year Range */}
        <div>
          <label className="text-sm font-medium mb-2 block">Year Range</label>
          <DynamicInputRow gap={2} maxPerRow={2}>
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
          </DynamicInputRow>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Price Range (EUR)
          </label>
          <DynamicInputRow gap={2} maxPerRow={2}>
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
          </DynamicInputRow>
        </div>
      </DynamicInputRow>

      {/* Status and Is Stale in a row */}
      <DynamicInputRow gap={4} maxPerRow={2}>
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
      </DynamicInputRow>

      {/* Reset Filters */}
      <Button variant="outline" className="w-full" onClick={onReset}>
        Clear All Filters
      </Button>
    </CardContent>
  );
};
