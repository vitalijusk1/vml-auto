import { LoadingState } from "@/components/ui/LoadingState";
import { FilterState } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";
import { BrandFilter } from "../shared/BrandFilter";
import { ModelFilter } from "../shared/ModelFilter";
import { BodyTypeFilter } from "../shared/BodyTypeFilter";
import { EngineCapacityFilter } from "../shared/EngineCapacityFilter";
import { FuelTypeFilter } from "../shared/FuelTypeFilter";
import { YearRangeFilter } from "../shared/YearRangeFilter";
import { PriceRangeFilter } from "../shared/PriceRangeFilter";
import { brandChangeHandler, rangeHandler } from "@/utils/filterHelpers";

interface ReturnsFiltersProps {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
}

export const ReturnsFilters = ({
  filters,
  onFiltersChange,
}: ReturnsFiltersProps) => {
  const backendFilters = useAppSelector(selectBackendFilters);

  if (backendFilters === null) {
    return <LoadingState message="Kraunami filtrai..." />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Brand (Manufacturer) */}
        <BrandFilter
          selected={filters.carBrand || []}
          onChange={brandChangeHandler(onFiltersChange)}
        />

        {/* Model */}
        <ModelFilter
          selected={filters.carModel || []}
          selectedBrands={filters.carBrand || []}
          onChange={(selected) =>
            onFiltersChange({ carModel: selected } as Partial<FilterState>)
          }
        />

        {/* Body Type */}
        <BodyTypeFilter
          selected={filters.bodyType || []}
          onChange={(selected) =>
            onFiltersChange({ bodyType: selected } as Partial<FilterState>)
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
          useBackendOptions={true}
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

        {/* Price Range */}
        <PriceRangeFilter
          min={filters.priceRange?.min}
          max={filters.priceRange?.max}
          onChange={rangeHandler(
            onFiltersChange,
            "priceRange",
            filters.priceRange
          )}
        />
      </div>
    </div>
  );
};
