import { CardContent } from "@/components/ui/card";
import { FilterState, Car } from "@/types";
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
import {
  createBrandChangeHandler,
  createStringArrayHandler,
  createRangeHandler,
} from "@/utils/filterHelpers";

interface AnalyticsFiltersProps {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  cars?: Car[];
}

export const AnalyticsFilters = ({
  filters,
  onFiltersChange,
  onReset: _onReset,
  cars: _cars = [],
}: AnalyticsFiltersProps) => {
  const backendFilters = useAppSelector(selectBackendFilters);

  if (backendFilters === null) {
    return (
      <CardContent>
        <p className="text-muted-foreground text-sm">Kraunami filtrai...</p>
      </CardContent>
    );
  }

  return (
    <CardContent className="space-y-4">
      {/* Two rows of filters */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Row 1 */}
        {/* Brand (Manufacturer) */}
        <BrandFilter
          selected={filters.carBrand || []}
          onChange={createBrandChangeHandler(onFiltersChange)}
          // Don't pass onModelChange - AnalyticsFilters already clears carModel in onChange
        />

        {/* Model */}
        <ModelFilter
          selected={filters.carModel || []}
          selectedBrands={filters.carBrand || []}
          onChange={createStringArrayHandler(onFiltersChange, "carModel")}
        />

        {/* Body Type */}
        <BodyTypeFilter
          selected={filters.bodyType || []}
          onChange={createStringArrayHandler(onFiltersChange, "bodyType")}
        />

        {/* Quality */}
        <QualityFilter
          selected={filters.quality || []}
          onChange={createStringArrayHandler(onFiltersChange, "quality")}
        />

        {/* Position */}
        <PositionFilter
          selected={filters.position || []}
          onChange={createStringArrayHandler(onFiltersChange, "position")}
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Engine Volume */}
        <EngineCapacityFilter
          min={filters.engineCapacityRange?.min}
          max={filters.engineCapacityRange?.max}
          onChange={createRangeHandler(
            onFiltersChange,
            "engineCapacityRange",
            filters.engineCapacityRange
          )}
        />

        {/* Fuel Type */}
        <FuelTypeFilter
          selected={filters.fuelType || []}
          onChange={createStringArrayHandler(onFiltersChange, "fuelType")}
          useBackendOptions={false}
        />

        {/* Year Range */}
        <YearRangeFilter
          min={filters.yearRange?.min}
          max={filters.yearRange?.max}
          onChange={createRangeHandler(
            onFiltersChange,
            "yearRange",
            filters.yearRange
          )}
        />

        {/* Price Range */}
        <PriceRangeFilter
          min={filters.priceRange?.min}
          max={filters.priceRange?.max}
          onChange={createRangeHandler(
            onFiltersChange,
            "priceRange",
            filters.priceRange
          )}
        />
      </div>
    </CardContent>
  );
};
