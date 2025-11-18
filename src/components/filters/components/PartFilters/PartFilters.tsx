import { useMemo } from "react";
import { CardContent } from "@/components/ui/card";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { SingleSelectDropdown } from "@/components/ui/SingleSelectDropdown";
import { Input } from "@/components/ui/input";
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
  showOrderIdFilter?: boolean;
}

export const PartFilters = ({
  filters,
  onFiltersChange,
  onReset,
  cars: _cars = [],
  showOrderIdFilter = false,
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
      {/* Search / Order ID Filter - only for orders */}
      {showOrderIdFilter && (
        <div>
          <label className="text-sm font-medium mb-2 block">
            Užsakymo Nr.
          </label>
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
            <SingleSelectDropdown
              options={[
                { value: "", label: "Nuo" },
                ...Array.from(
                  { length: new Date().getFullYear() - 1959 },
                  (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return { value: year.toString(), label: year.toString() };
                  }
                ),
              ]}
              value={filters.yearRange?.min?.toString() || ""}
              onChange={(value: string) =>
                onFiltersChange({
                  yearRange: {
                    ...(filters.yearRange || {}),
                    min: value ? parseInt(value) : undefined,
                  },
                })
              }
              placeholder="Nuo"
              className="[&>button]:h-10"
            />
            <SingleSelectDropdown
              options={[
                { value: "", label: "Iki" },
                ...Array.from(
                  { length: new Date().getFullYear() - 1959 },
                  (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return { value: year.toString(), label: year.toString() };
                  }
                ),
              ]}
              value={filters.yearRange?.max?.toString() || ""}
              onChange={(value: string) =>
                onFiltersChange({
                  yearRange: {
                    ...(filters.yearRange || {}),
                    max: value ? parseInt(value) : undefined,
                  },
                })
              }
              placeholder="Iki"
              className="[&>button]:h-10"
            />
          </div>
        </div>

        {/* Price Range */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Kainos pasirinkimas
          </label>
          <div className="grid grid-cols-2 gap-2">
            <SingleSelectDropdown
              options={[
                { value: "", label: "Nuo" },
                { value: "0", label: "0" },
                { value: "10", label: "10" },
                { value: "25", label: "25" },
                { value: "50", label: "50" },
                { value: "100", label: "100" },
                { value: "250", label: "250" },
                { value: "500", label: "500" },
                { value: "1000", label: "1000" },
                { value: "2500", label: "2500" },
                { value: "5000", label: "5000" },
                { value: "10000", label: "10000" },
                { value: "25000", label: "25000" },
                { value: "50000", label: "50000" },
              ]}
              value={filters.priceRange?.min?.toString() || ""}
              onChange={(value: string) =>
                onFiltersChange({
                  priceRange: {
                    ...(filters.priceRange || {}),
                    min: value ? parseFloat(value) : undefined,
                  },
                })
              }
              placeholder="Nuo"
              className="[&>button]:h-10"
            />
            <SingleSelectDropdown
              options={[
                { value: "", label: "Iki" },
                { value: "10", label: "10" },
                { value: "25", label: "25" },
                { value: "50", label: "50" },
                { value: "100", label: "100" },
                { value: "250", label: "250" },
                { value: "500", label: "500" },
                { value: "1000", label: "1000" },
                { value: "2500", label: "2500" },
                { value: "5000", label: "5000" },
                { value: "10000", label: "10000" },
                { value: "25000", label: "25000" },
                { value: "50000", label: "50000" },
                { value: "100000", label: "100000+" },
              ]}
              value={filters.priceRange?.max?.toString() || ""}
              onChange={(value: string) =>
                onFiltersChange({
                  priceRange: {
                    ...(filters.priceRange || {}),
                    max: value ? parseFloat(value) : undefined,
                  },
                })
              }
              placeholder="Iki"
              className="[&>button]:h-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
