import { LoadingState } from "@/components/ui/LoadingState";
import { FilterState } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";
import { BrandFilter } from "../shared/BrandFilter";
import { ModelFilter } from "../shared/ModelFilter";
import { FuelTypeFilter } from "../shared/FuelTypeFilter";
import { YearRangeFilter } from "../shared/YearRangeFilter";
import { BodyTypeFilter } from "../shared/BodyTypeFilter";
import { QualityFilter } from "../shared/QualityFilter";
import { PositionFilter } from "../shared/PositionFilter";
import { StatusFilter } from "../shared/StatusFilter";
import { PriceRangeFilter } from "../shared/PriceRangeFilter";
import { EngineCapacityFilter } from "../shared/EngineCapacityFilter";
import { brandChangeHandler, rangeHandler } from "@/utils/filterHelpers";

interface PartFiltersProps {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
}

export const PartFilters = ({ filters, onFiltersChange }: PartFiltersProps) => {
  const backendFilters = useAppSelector(selectBackendFilters);

  if (backendFilters === null) {
    return <LoadingState message="Kraunami filtrai..." />;
  }

  return (
    <div className="space-y-4">
      {/* Single grid layout: 1 col 0-440px, 2 cols 440-635px, 3 cols 635px+, 5 cols 1280px+ */}
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
          useBackendOptions={true}
        />

        {/* Status */}
        <StatusFilter
          selected={filters.status === "All" ? [] : filters.status}
          onChange={(selected) =>
            onFiltersChange({
              status: selected.length === 0 ? "All" : selected,
            })
          }
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
