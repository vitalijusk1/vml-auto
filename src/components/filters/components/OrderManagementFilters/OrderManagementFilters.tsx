import { FilterState } from "@/types";
import { LoadingState } from "@/components/ui/LoadingState";
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
}

export const OrderManagementFilters = ({
  filters,
  onFiltersChange,
}: OrderManagementFiltersProps) => {
  const backendFilters = useAppSelector(selectBackendFilters);

  if (backendFilters === null) {
    return <LoadingState message="Kraunami filtrai..." />;
  }

  return (
    <div className="space-y-4">
      {/* Single grid layout: 1 col 0-440px, 2 cols 440-635px, 3 cols 635px+, 5 cols 1280px+ */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Brand (Manufacturer) - single select for order control */}
        <BrandFilter
          required={true}
          selected={filters.carBrand || []}
          onChange={brandChangeHandler(onFiltersChange)}
          singleSelect={true}
        />

        {/* Model - single select for order control */}
        <ModelFilter
          required={true}
          selected={filters.carModel || []}
          selectedBrands={filters.carBrand || []}
          onChange={(selected) =>
            onFiltersChange({ carModel: selected } as Partial<FilterState>)
          }
          singleSelect={true}
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
