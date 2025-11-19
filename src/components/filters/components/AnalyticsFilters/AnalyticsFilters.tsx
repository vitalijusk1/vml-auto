import { CardContent } from "@/components/ui/card";
import { FilterState, PartQuality, PartPosition, FuelType, Car } from "@/types";
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
          selected={filters.carModel || []}
          selectedBrands={filters.carBrand || []}
          onChange={(selected) => onFiltersChange({ carModel: selected })}
        />

        {/* Body Type */}
        <BodyTypeFilter
          selected={filters.bodyType || []}
          onChange={(selected) =>
            onFiltersChange({ bodyType: selected as any })
          }
        />

        {/* Quality */}
        <QualityFilter
          selected={filters.quality || []}
          onChange={(selected) =>
            onFiltersChange({ quality: selected as PartQuality[] })
          }
        />

        {/* Position */}
        <PositionFilter
          selected={filters.position || []}
          onChange={(selected) =>
            onFiltersChange({ position: selected as PartPosition[] })
          }
        />
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Engine Volume */}
        <EngineCapacityFilter
          min={filters.engineCapacityRange?.min}
          max={filters.engineCapacityRange?.max}
          onChange={(range: { min?: number; max?: number }) =>
            onFiltersChange({
              engineCapacityRange: {
                ...(filters.engineCapacityRange || {}),
                ...range,
              },
            })
          }
        />

        {/* Fuel Type */}
        <FuelTypeFilter
          selected={filters.fuelType || []}
          onChange={(selected) =>
            onFiltersChange({ fuelType: selected as FuelType[] })
          }
          useBackendOptions={false}
        />

        {/* Year Range */}
        <YearRangeFilter
          min={filters.yearRange?.min}
          max={filters.yearRange?.max}
          onChange={(range) =>
            onFiltersChange({
              yearRange: {
                ...(filters.yearRange || {}),
                ...range,
              },
            })
          }
        />

        {/* Price Range */}
        <PriceRangeFilter
          min={filters.priceRange?.min}
          max={filters.priceRange?.max}
          onChange={(range) =>
            onFiltersChange({
              priceRange: {
                ...(filters.priceRange || {}),
                ...range,
              },
            })
          }
        />
      </div>
    </CardContent>
  );
};
