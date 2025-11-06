import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";
import { useAppSelector } from "@/store/hooks";
import { selectCars } from "@/store/selectors";
import { FuelType, BodyType } from "@/types";
import { X, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { CarFilterState, defaultCarFilters } from "@/utils/filterCars";

interface CarFilterPanelProps {
  filters: CarFilterState;
  onFiltersChange: (filters: CarFilterState) => void;
}

export function CarFilterPanel({
  filters,
  onFiltersChange,
}: CarFilterPanelProps) {
  const cars = useAppSelector(selectCars);
  const [isOpen, setIsOpen] = useState(true);

  const updateFilters = (updates: Partial<CarFilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const resetFilters = () => {
    onFiltersChange(defaultCarFilters);
  };

  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.brand))).sort();
  }, [cars]);

  const uniqueModels = useMemo(() => {
    if (filters.brand.length === 0) {
      return Array.from(new Set(cars.map((c) => c.model.name))).sort();
    }
    return Array.from(
      new Set(
        cars
          .filter((c) => filters.brand.includes(c.brand))
          .map((c) => c.model.name)
      )
    ).sort();
  }, [cars, filters.brand]);

  const uniqueYears = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.year))).sort((a, b) => b - a);
  }, [cars]);

  const uniqueGearboxes = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.gearbox_type.name))).sort();
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
          {/* Search */}
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              placeholder="Brand, model, ID, engine code..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>

          {/* Mileage Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Mileage (km)
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.mileageRange.min || ""}
                onChange={(e) =>
                  updateFilters({
                    mileageRange: {
                      ...filters.mileageRange,
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
                value={filters.mileageRange.max || ""}
                onChange={(e) =>
                  updateFilters({
                    mileageRange: {
                      ...filters.mileageRange,
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
            {/* Brand */}
            <div>
              <label className="text-sm font-medium mb-2 block">Brand</label>
              <MultiSelectDropdown
                options={uniqueBrands}
                selected={filters.brand}
                onChange={(selected) => updateFilters({ brand: selected })}
                placeholder="Select brands..."
              />
            </div>

            {/* Model */}
            <div>
              <label className="text-sm font-medium mb-2 block">Model</label>
              <MultiSelectDropdown
                options={uniqueModels}
                selected={filters.model}
                onChange={(selected) => updateFilters({ model: selected })}
                placeholder="Select models..."
              />
            </div>

            {/* Year */}
            <div>
              <label className="text-sm font-medium mb-2 block">Year</label>
              <MultiSelectDropdown
                options={uniqueYears.map(String)}
                selected={filters.year.map(String)}
                onChange={(selected) => updateFilters({ year: selected.map(Number) })}
                placeholder="Select years..."
              />
            </div>

            {/* Fuel Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Fuel Type</label>
              <MultiSelectDropdown
                options={["Petrol", "Diesel", "Electric", "Hybrid"] as FuelType[]}
                selected={filters.fuelType}
                onChange={(selected) => updateFilters({ fuelType: selected })}
                placeholder="Select fuel types..."
              />
            </div>

            {/* Body Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Body Type</label>
              <MultiSelectDropdown
                options={["Sedan", "Hatchback", "SUV", "Coupe", "Estate", "Van"] as BodyType[]}
                selected={filters.bodyType}
                onChange={(selected) => updateFilters({ bodyType: selected })}
                placeholder="Select body types..."
              />
            </div>

            {/* Gearbox */}
            <div>
              <label className="text-sm font-medium mb-2 block">Gearbox</label>
              <MultiSelectDropdown
                options={uniqueGearboxes}
                selected={filters.gearbox}
                onChange={(selected) => updateFilters({ gearbox: selected })}
                placeholder="Select gearbox types..."
              />
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
