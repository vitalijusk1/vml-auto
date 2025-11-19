import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  FilterState,
  PartStatus,
  PartQuality,
  PartPosition,
  Car,
  FuelType,
} from "@/types";
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

interface PartFiltersProps {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  cars?: Car[];
  showOrderIdFilter?: boolean;
}

export const PartFilters = ({
  filters,
  onFiltersChange,
  cars: _cars = [],
  showOrderIdFilter = false,
}: PartFiltersProps) => {
  const backendFilters = useAppSelector(selectBackendFilters);

  if (backendFilters === null) {
    return (
      <CardContent>
        <p className="text-muted-foreground text-sm">Kraunami filtrai...</p>
      </CardContent>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search / Order ID Filter - only for orders */}
      {showOrderIdFilter && (
        <div>
          <label className="text-sm font-medium mb-2 block">Užsakymo Nr.</label>
          <Input
            placeholder="Ieškoti pagal užsakymo numerį..."
            value={filters.search || ""}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="max-w-md"
          />
        </div>
      )}
      {/* Single grid layout: 1 col 0-440px, 2 cols 440-635px, 3 cols 635px+, 5 cols 1280px+ */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Brand (Manufacturer) */}
        <BrandFilter
          selected={filters.carBrand || []}
          onChange={(selected: string[]) => {
            onFiltersChange({
              carBrand: selected,
              carModel: [],
            });
          }}
        />

        {/* Model */}
        <ModelFilter
          selected={filters.carModel || []}
          selectedBrands={filters.carBrand || []}
          onChange={(selected: string[]) =>
            onFiltersChange({ carModel: selected })
          }
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
          onChange={(selected: string[]) =>
            onFiltersChange({ fuelType: selected as FuelType[] })
          }
          useBackendOptions={true}
        />

        {/* Status */}
        <StatusFilter
          selected={
            filters.status === "All" ? [] : (filters.status as string[])
          }
          onChange={(selected) =>
            onFiltersChange({
              status:
                selected.length === 0 ? "All" : (selected as PartStatus[]),
            })
          }
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
    </div>
  );
};
