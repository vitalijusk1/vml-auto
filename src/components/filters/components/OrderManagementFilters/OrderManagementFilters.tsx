import { FilterState, FuelType } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";
import { BrandFilter } from "../shared/BrandFilter";
import { ModelFilter } from "../shared/ModelFilter";
import { FuelTypeFilter } from "../shared/FuelTypeFilter";
import { YearRangeFilter } from "../shared/YearRangeFilter";
import { EngineCapacityFilter } from "../shared/EngineCapacityFilter";

interface OrderManagementFiltersProps {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  cars?: unknown[];
}

export const OrderManagementFilters = ({
  filters,
  onFiltersChange,
  onReset: _onReset,
  cars: _cars = [],
}: OrderManagementFiltersProps) => {
  const backendFilters = useAppSelector(selectBackendFilters);

  if (backendFilters === null) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">Kraunami filtrai...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Single grid layout: 1 col 0-440px, 2 cols 440-635px, 3 cols 635px+, 5 cols 1280px+ */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Brand (Manufacturer) */}
        <BrandFilter
          required={true}
          selected={filters.carBrand || []}
          onChange={(selected) => {
            onFiltersChange({
              carBrand: selected,
              carModel: [],
            });
          }}
          onModelChange={(models) => onFiltersChange({ carModel: models })}
        />

        {/* Model */}
        <ModelFilter
          required={true}
          selected={filters.carModel || []}
          selectedBrands={filters.carBrand || []}
          onChange={(selected) => onFiltersChange({ carModel: selected })}
        />

        {/* Engine Capacity */}
        <EngineCapacityFilter
          selected={filters.engineCapacity || []}
          onChange={(selected: string[]) =>
            onFiltersChange({ engineCapacity: selected })
          }
        />

        {/* Fuel Type */}
        <FuelTypeFilter
          selected={filters.fuelType || []}
          onChange={(selected: string[]) =>
            onFiltersChange({ fuelType: selected as FuelType[] })
          }
          useBackendOptions={false}
        />

        {/* Year Range */}
        <YearRangeFilter
          min={filters.yearRange?.min}
          max={filters.yearRange?.max}
          onChange={(range: { min?: number; max?: number }) =>
            onFiltersChange({
              yearRange: {
                ...(filters.yearRange || {}),
                ...range,
              },
            })
          }
        />
      </div>
    </div>
  );
};
