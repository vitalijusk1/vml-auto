import { useMemo } from "react";
import { CardContent } from "@/components/ui/card";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { SingleSelectDropdown } from "@/components/ui/SingleSelectDropdown";
import {
  FilterState,
  PartQuality,
  PartPosition,
  BodyType,
  FuelType,
  Car,
} from "@/types";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";

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

  // Extract filter options from backend
  const {
    brands,
    models: allModels,
    bodyTypes,
    qualities,
    positions,
  } = useBackendFilters();

  // Filter models based on selected brands
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
            return model.name || String(model);
          });
          allModelsFromBrands.push(...brandModels);
        }
      }
      return [...new Set(allModelsFromBrands)];
    }

    // Get selected brand names and find matching brands
    const selectedBrandNames = filters.carBrand;
    const modelsByBrand: string[] = [];

    for (const brand of backendFiltersData.car.brands) {
      const brandName =
        brand.languages?.en || brand.languages?.name || brand.name;
      if (selectedBrandNames.includes(brandName)) {
        if (brand.models && Array.isArray(brand.models)) {
          const brandModels = brand.models.map((model: any) => {
            return model.name || String(model);
          });
          modelsByBrand.push(...brandModels);
        }
      }
    }

    return [...new Set(modelsByBrand)];
  }, [allModels, filters.carBrand, backendFilters]);

  // Generate engine capacity options (common values in cc)
  const engineCapacityOptions = useMemo(() => {
    const capacities = [
      "800",
      "1000",
      "1200",
      "1400",
      "1600",
      "1800",
      "2000",
      "2200",
      "2400",
      "2600",
      "2800",
      "3000",
      "3200",
      "3500",
      "4000",
      "4500",
      "5000",
    ];
    return capacities;
  }, []);

  // Fuel type options
  const fuelTypeOptions: FuelType[] = [
    "Petrol",
    "Diesel",
    "Electric",
    "Hybrid",
  ];

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
            placeholder="Visos"
            searchable={true}
            searchPlaceholder="Ieškoti kokybių..."
          />
        </div>

        {/* Position */}
        <div>
          <label className="text-sm font-medium mb-2 block">Pozicija</label>
          <MultiSelectDropdown
            options={positions}
            selected={filters.position || []}
            onChange={(selected) =>
              onFiltersChange({ position: selected as PartPosition[] })
            }
            placeholder="Visos"
            searchable={true}
            searchPlaceholder="Ieškoti pozicijų..."
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Engine Volume */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Variklio tūris
          </label>
          <MultiSelectDropdown
            options={engineCapacityOptions}
            selected={filters.engineCapacity || []}
            onChange={(selected) =>
              onFiltersChange({ engineCapacity: selected })
            }
            placeholder="Visi"
            searchable={true}
            searchPlaceholder="Ieškoti variklio tūrių..."
          />
        </div>

        {/* Fuel Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">Kuro tipas</label>
          <MultiSelectDropdown
            options={fuelTypeOptions}
            selected={filters.fuelType || []}
            onChange={(selected) =>
              onFiltersChange({ fuelType: selected as FuelType[] })
            }
            placeholder="Visi"
            searchable={true}
            searchPlaceholder="Ieškoti kuro tipų..."
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
            Kainų pasirinkimas
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
    </CardContent>
  );
};
