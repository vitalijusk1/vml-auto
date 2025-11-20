import { FilterState } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";
import { BrandFilter } from "../shared/BrandFilter";
import { ModelFilter } from "../shared/ModelFilter";
import { FuelTypeFilter } from "../shared/FuelTypeFilter";
import { YearRangeFilter } from "../shared/YearRangeFilter";
import { brandChangeHandler, rangeHandler } from "@/utils/filterHelpers";
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
          onChange={brandChangeHandler(onFiltersChange)}
        />

        {/* Model */}
        <ModelFilter
          required={true}
          selected={filters.carModel || []}
          selectedBrands={filters.carBrand || []}
          onChange={(selected) =>
            onFiltersChange({ carModel: selected } as Partial<FilterState>)
          }
        />

        {/* Engine Capacity */}
        <EngineCapacityFilter
          min={filters.engineCapacityRange?.min}
          max={filters.engineCapacityRange?.max}
          onChange={rangeHandler(
            onFiltersChange,
            "engineCapacityRange",
            filters.engineCapacityRange
          )}
        />

        {/* Fuel Type */}
        <FuelTypeFilter
          selected={filters.fuelType || []}
          onChange={(selected) =>
            onFiltersChange({ fuelType: selected } as Partial<FilterState>)
          }
          useBackendOptions={false}
        />

        {/* Year Range */}
        <YearRangeFilter
          min={filters.yearRange?.min}
          max={filters.yearRange?.max}
          onChange={rangeHandler(
            onFiltersChange,
            "yearRange",
            filters.yearRange
          )}
        />
      </div>
    </div>
  );
};
