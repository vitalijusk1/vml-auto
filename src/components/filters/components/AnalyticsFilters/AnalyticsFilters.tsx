import { CardContent } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/LoadingState";
import { FilterState } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";
import { BrandFilter } from "../shared/BrandFilter";
import { ModelFilter } from "../shared/ModelFilter";
import { BodyTypeFilter } from "../shared/BodyTypeFilter";
import { QualityFilter } from "../shared/QualityFilter";
import { PositionFilter } from "../shared/PositionFilter";
import { EngineCapacityFilter } from "../shared/EngineCapacityFilter";
import { FuelTypeFilter } from "../shared/FuelTypeFilter";
import { YearRangeFilter } from "../shared/YearRangeFilter";
import { PriceRangeFilter } from "../shared/PriceRangeFilter";
import { brandChangeHandler, rangeHandler } from "@/utils/filterHelpers";

interface AnalyticsFiltersProps {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
}

export const AnalyticsFilters = ({
  filters,
  onFiltersChange,
}: AnalyticsFiltersProps) => {
  const backendFilters = useAppSelector(selectBackendFilters);

  if (backendFilters === null) {
    return <LoadingState message="Kraunami filtrai..." />;
  }

  return (
    <CardContent className="space-y-4">
      {/* Two rows of filters */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Row 1 */}
        {/* Brand (Manufacturer) */}
        <BrandFilter
          selected={filters.carBrand || []}
          onChange={brandChangeHandler(onFiltersChange)}
          // Don't pass onModelChange - AnalyticsFilters already clears carModel in onChange
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

        {/* Quality */}
        <QualityFilter
          selected={filters.quality || []}
          onChange={(selected) =>
            onFiltersChange({ quality: selected } as Partial<FilterState>)
          }
        />

        {/* Position */}
        <PositionFilter
          selected={filters.position || []}
          onChange={(selected) =>
            onFiltersChange({ position: selected } as Partial<FilterState>)
          }
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Engine Volume */}
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
    </CardContent>
  );
};
