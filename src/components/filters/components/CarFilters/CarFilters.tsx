import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { CarFilterState } from "@/utils/filterCars";
import { FuelType, BodyType } from "@/types";
import { useFilters } from "../useFilters";

interface CarFiltersProps {
  filters: CarFilterState;
  onFiltersChange: (updates: Partial<CarFilterState>) => void;
  onReset: () => void;
}

export const CarFilters = ({
  filters,
  onFiltersChange,
  onReset,
}: CarFiltersProps) => {
  const {
    uniqueBrands,
    uniqueModels,
    uniqueYears,
    uniqueGearboxes,
    uniqueWheelDrives,
  } = useFilters(filters);
  return (
    <CardContent className="space-y-4">
      {/* Mileage Range */}
      <div>
        <label className="text-sm font-medium mb-2 block">Mileage (km)</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={filters.mileageRange.min || ""}
            onChange={(e) =>
              onFiltersChange({
                mileageRange: {
                  ...filters.mileageRange,
                  min: e.target.value ? parseFloat(e.target.value) : undefined,
                },
              })
            }
          />
          <Input
            type="number"
            placeholder="Max"
            value={filters.mileageRange.max || ""}
            onChange={(e) =>
              onFiltersChange({
                mileageRange: {
                  ...filters.mileageRange,
                  max: e.target.value ? parseFloat(e.target.value) : undefined,
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
            selected={filters.brand || []}
            onChange={(selected) => onFiltersChange({ brand: selected })}
            placeholder="Select brands..."
          />
        </div>

        {/* Model */}
        <div>
          <label className="text-sm font-medium mb-2 block">Model</label>
          <MultiSelectDropdown
            options={uniqueModels}
            selected={filters.model || []}
            onChange={(selected) => onFiltersChange({ model: selected })}
            placeholder="Select models..."
          />
        </div>

        {/* Year */}
        <div>
          <label className="text-sm font-medium mb-2 block">Year</label>
          <MultiSelectDropdown
            options={uniqueYears.map(String)}
            selected={(filters.year || []).map(String)}
            onChange={(selected) =>
              onFiltersChange({ year: selected.map(Number) })
            }
            placeholder="Select years..."
          />
        </div>

        {/* Fuel Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Fuel Type</label>
          <MultiSelectDropdown
            options={["Petrol", "Diesel", "Electric", "Hybrid"] as FuelType[]}
            selected={filters.fuelType || []}
            onChange={(selected) => onFiltersChange({ fuelType: selected })}
            placeholder="Select fuel types..."
          />
        </div>

        {/* Body Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Body Type</label>
          <MultiSelectDropdown
            options={
              [
                "Sedan",
                "Hatchback",
                "SUV",
                "Coupe",
                "Estate",
                "Van",
              ] as BodyType[]
            }
            selected={filters.bodyType || []}
            onChange={(selected) => onFiltersChange({ bodyType: selected })}
            placeholder="Select body types..."
          />
        </div>

        {/* Gearbox */}
        <div>
          <label className="text-sm font-medium mb-2 block">Gearbox</label>
          <MultiSelectDropdown
            options={uniqueGearboxes}
            selected={filters.gearbox || []}
            onChange={(selected) => onFiltersChange({ gearbox: selected })}
            placeholder="Select gearbox types..."
          />
        </div>

        {/* Wheel Drive */}
        <div>
          <label className="text-sm font-medium mb-2 block">Wheel Drive</label>
          <MultiSelectDropdown
            options={uniqueWheelDrives}
            selected={filters.wheelDrive || []}
            onChange={(selected) => onFiltersChange({ wheelDrive: selected })}
            placeholder="Select wheel drive..."
          />
        </div>
      </div>

      {/* Reset Filters */}
      <Button variant="outline" className="w-full" onClick={onReset}>
        Clear All Filters
      </Button>
    </CardContent>
  );
};
