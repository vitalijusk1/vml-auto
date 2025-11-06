import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { useAppSelector } from "@/store/hooks";
import { selectCars, selectParts } from "@/store/selectors";
import { FilterState, PartStatus, PartQuality } from "@/types";
import { X, Filter } from "lucide-react";
import { useState, useMemo } from "react";

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const cars = useAppSelector(selectCars);
  const parts = useAppSelector(selectParts);
  const [isOpen, setIsOpen] = useState(true);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const resetFilters = () => {
    onFiltersChange({
      search: "",
      status: "All",
      dateRange: {},
      carBrand: [],
      carModel: [],
      carYear: [],
      fuelType: [],
      bodyType: [],
      partCategory: [],
      partType: [],
      quality: [],
      position: [],
      priceRange: {},
      inventoryAge: {},
    });
  };

  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.brand))).sort();
  }, [cars]);

  const uniqueModels = useMemo(() => {
    if (filters.carBrand.length === 0) {
      return Array.from(new Set(cars.map((c) => c.model.name))).sort();
    }
    return Array.from(
      new Set(
        cars
          .filter((c) => filters.carBrand.includes(c.brand))
          .map((c) => c.model.name)
      )
    ).sort();
  }, [cars, filters.carBrand]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(parts.map((p) => p.category))).sort();
  }, [parts]);

  const uniqueYears = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.year))).sort((a, b) => b - a);
  }, [cars]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
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
          {/* Search and Status in a row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Part name, code, manufacturer..."
                value={filters.search}
                onChange={(e) => updateFilters({ search: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status}
                onChange={(e) =>
                  updateFilters({
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
          </div>

          {/* Price Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Price Range (EUR)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min || ""}
                onChange={(e) =>
                  updateFilters({
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
                  updateFilters({
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

          {/* Multi-select filters in a grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Car Brand */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Car Brand
              </label>
              <MultiSelectDropdown
                options={uniqueBrands}
                selected={filters.carBrand}
                onChange={(selected) => updateFilters({ carBrand: selected })}
                placeholder="Select brands..."
              />
            </div>

            {/* Car Model */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Car Model
              </label>
              <MultiSelectDropdown
                options={uniqueModels}
                selected={filters.carModel}
                onChange={(selected) => updateFilters({ carModel: selected })}
                placeholder="Select models..."
              />
            </div>

            {/* Car Year */}
            <div>
              <label className="text-sm font-medium mb-2 block">Car Year</label>
              <MultiSelectDropdown
                options={uniqueYears.map(String)}
                selected={filters.carYear.map(String)}
                onChange={(selected) =>
                  updateFilters({ carYear: selected.map(Number) })
                }
                placeholder="Select years..."
              />
            </div>

            {/* Part Category */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Part Category
              </label>
              <MultiSelectDropdown
                options={uniqueCategories}
                selected={filters.partCategory}
                onChange={(selected) =>
                  updateFilters({ partCategory: selected })
                }
                placeholder="Select categories..."
              />
            </div>

            {/* Quality */}
            <div>
              <label className="text-sm font-medium mb-2 block">Quality</label>
              <MultiSelectDropdown
                options={
                  ["New", "Used", "With Defects", "Restored"] as PartQuality[]
                }
                selected={filters.quality}
                onChange={(selected) => updateFilters({ quality: selected })}
                placeholder="Select quality..."
              />
            </div>
          </div>

          {/* Inventory Age Quick Filters */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Inventory Age
            </label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant={
                  filters.inventoryAge.quickFilter === "stale"
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  updateFilters({
                    inventoryAge: {
                      quickFilter:
                        filters.inventoryAge.quickFilter === "stale"
                          ? undefined
                          : "stale",
                    },
                  })
                }
              >
                Stale (6+ months)
              </Button>
              <Button
                variant={
                  filters.inventoryAge.quickFilter === "new"
                    ? "default"
                    : "outline"
                }
                size="sm"
                onClick={() =>
                  updateFilters({
                    inventoryAge: {
                      quickFilter:
                        filters.inventoryAge.quickFilter === "new"
                          ? undefined
                          : "new",
                    },
                  })
                }
              >
                New Arrivals (&lt; 1 month)
              </Button>
            </div>
          </div>

          {/* Reset Filters */}
          <Button variant="outline" className="w-full" onClick={resetFilters}>
            Clear All Filters
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
