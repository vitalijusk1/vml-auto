import { useMemo } from "react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import {
  FilterState,
  PartStatus,
  PartQuality,
  PartPosition,
  BodyType,
  Car,
} from "@/types";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";

interface PartFiltersProps {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  cars?: Car[];
}

export const PartFilters = ({
  filters,
  onFiltersChange,
  onReset,
  cars: _cars = [],
}: PartFiltersProps) => {
  const backendFilters = useAppSelector(selectBackendFilters);

  // Extract all filter options from backend using shared hook
  const {
    brands,
    models: allModels,
    bodyTypes,
    statuses,
    qualities,
    positions,
  } = useBackendFilters();

  // Filter models based on selected brands
  // Models are nested under brands in the backend structure
  const models = useMemo(() => {
    const backendFiltersData = backendFilters as any;
    if (
      !backendFiltersData?.car?.brands ||
      !Array.isArray(backendFiltersData.car.brands)
    ) {
      return allModels;
    }

    // If no brands selected, return all models from all brands
    if (!filters.carBrand || filters.carBrand.length === 0) {
      const allModelsFromBrands: string[] = [];
      for (const brand of backendFiltersData.car.brands) {
        if (brand.models && Array.isArray(brand.models)) {
          const brandModels = brand.models.map((model: any) => {
            // Models have name directly, no languages property
            return model.name || String(model);
          });
          allModelsFromBrands.push(...brandModels);
        }
      }
      return [...new Set(allModelsFromBrands)]; // Remove duplicates
    }

    // Get selected brand names and find matching brands
    const selectedBrandNames = filters.carBrand;
    const modelsByBrand: string[] = [];

    for (const brand of backendFiltersData.car.brands) {
      // Extract brand name
      const brandName =
        typeof brand === "string"
          ? brand
          : brand.languages?.en || brand.languages?.name || brand.name;

      // Check if this brand is selected
      if (selectedBrandNames.includes(brandName)) {
        // Extract models from this brand
        if (brand.models && Array.isArray(brand.models)) {
          const brandModels = brand.models.map((model: any) => {
            // Models have name directly
            return model.name || String(model);
          });
          modelsByBrand.push(...brandModels);
        }
      }
    }

    // Return unique models from selected brands
    return [...new Set(modelsByBrand)];
  }, [allModels, filters.carBrand, backendFilters]);

  if (backendFilters === null) {
    return (
      <CardContent>
        <p className="text-muted-foreground text-sm">Kraunami filtrai...</p>
      </CardContent>
    );
  }

  return (
    <div className="space-y-4">
      {/* Single grid layout: 1 col 0-440px, 2 cols 440-635px, 3 cols 635px+, 5 cols 1280px+ */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Brand (Manufacturer) */}
        <div>
          <label className="text-sm font-medium mb-2 block">Gamintojas</label>
          <MultiSelectDropdown
            options={brands}
            selected={filters.carBrand || []}
            onChange={(selected) => {
              onFiltersChange({
                carBrand: selected,
                carModel: [],
              });
            }}
            placeholder="Visi"
            searchable={true}
            searchPlaceholder="Ieškoti gamintojų..."
          />
        </div>

        {/* Model */}
        <div>
          <label className="text-sm font-medium mb-2 block">Modelis</label>
          <MultiSelectDropdown
            options={models}
            selected={filters.carModel || []}
            onChange={(selected) => onFiltersChange({ carModel: selected })}
            placeholder="Visi"
            searchable={true}
            searchPlaceholder="Ieškoti modelių..."
          />
        </div>

        {/* Body Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Kėbulo tipas</label>
          <MultiSelectDropdown
            options={bodyTypes as BodyType[]}
            selected={filters.bodyType || []}
            onChange={(selected) => onFiltersChange({ bodyType: selected })}
            placeholder="Visi"
            searchable={true}
            searchPlaceholder="Ieškoti kėbulo tipų..."
          />
        </div>

        {/* Quality */}
        <div>
          <label className="text-sm font-medium mb-2 block">Kokybė</label>
          <MultiSelectDropdown
            options={qualities}
            selected={filters.quality || []}
            onChange={(selected) =>
              onFiltersChange({ quality: selected as PartQuality[] })
            }
            placeholder="Visi"
            searchable={true}
            searchPlaceholder="Ieškoti kokybių..."
          />
        </div>

        {/* Position */}
        <div>
          <label className="text-sm font-medium mb-2 block">Padėtis</label>
          <MultiSelectDropdown
            options={positions}
            selected={filters.position || []}
            onChange={(selected) =>
              onFiltersChange({ position: selected as PartPosition[] })
            }
            placeholder="Visi"
            searchable={true}
            searchPlaceholder="Ieškoti padėčių..."
          />
        </div>

        {/* Engine Volume - Note: This might need to be extracted from car data */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Variklio tūris
          </label>
          <MultiSelectDropdown
            options={[]}
            selected={[]}
            onChange={() => {}}
            placeholder="Visi"
            searchable={false}
          />
        </div>

        {/* Fuel Type - Note: This might need to be extracted from car data */}
        <div>
          <label className="text-sm font-medium mb-2 block">Kuro tipas</label>
          <MultiSelectDropdown
            options={[]}
            selected={[]}
            onChange={() => {}}
            placeholder="Visi"
            searchable={false}
          />
        </div>

        {/* Status */}
        <div>
          <label className="text-sm font-medium mb-2 block">Būsena</label>
          <MultiSelectDropdown
            options={statuses}
            selected={
              filters.status === "All" ? [] : (filters.status as string[])
            }
            onChange={(selected) =>
              onFiltersChange({
                status:
                  selected.length === 0 ? "All" : (selected as PartStatus[]),
              })
            }
            placeholder="Visi"
            searchable={true}
            searchPlaceholder="Ieškoti būsenų..."
          />
        </div>

        {/* Year Range */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Metų pasirinkimas
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Nuo"
              value={filters.yearRange?.min || ""}
              onChange={(e) =>
                onFiltersChange({
                  yearRange: {
                    ...(filters.yearRange || {}),
                    min: e.target.value ? parseInt(e.target.value) : undefined,
                  },
                })
              }
            />
            <Input
              type="number"
              placeholder="Iki"
              value={filters.yearRange?.max || ""}
              onChange={(e) =>
                onFiltersChange({
                  yearRange: {
                    ...(filters.yearRange || {}),
                    max: e.target.value ? parseInt(e.target.value) : undefined,
                  },
                })
              }
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Kainos pasirinkimas
          </label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Nuo"
              value={filters.priceRange?.min || ""}
              onChange={(e) =>
                onFiltersChange({
                  priceRange: {
                    ...(filters.priceRange || {}),
                    min: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  },
                })
              }
            />
            <Input
              type="number"
              placeholder="Iki"
              value={filters.priceRange?.max || ""}
              onChange={(e) =>
                onFiltersChange({
                  priceRange: {
                    ...(filters.priceRange || {}),
                    max: e.target.value
                      ? parseFloat(e.target.value)
                      : undefined,
                  },
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};
