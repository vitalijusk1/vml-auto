import { useMemo } from "react";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { SingleSelectDropdown } from "@/components/ui/SingleSelectDropdown";
import { FilterState, FuelType } from "@/types";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";

interface OrderManagementFiltersProps {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  cars?: unknown[];
}

export const OrderManagementFilters = ({
  filters,
  onFiltersChange,
  onReset: _onReset,
  cars: _cars = [],
}: OrderManagementFiltersProps) => {
  const backendFilters = useAppSelector(selectBackendFilters);

  // Extract filter options from backend using shared hook
  const {
    brands,
    models: allModels,
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
        typeof brand === "string"
          ? brand
          : brand.languages?.en || brand.languages?.name || brand.name;

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
      "800", "1000", "1200", "1400", "1600", "1800", "2000", "2200",
      "2400", "2600", "2800", "3000", "3200", "3500", "4000", "4500", "5000"
    ];
    return capacities;
  }, []);

  // Fuel type options
  const fuelTypeOptions: FuelType[] = ["Petrol", "Diesel", "Electric", "Hybrid"];

  if (backendFilters === null) {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">Kraunami filtrai...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Single grid layout: 1 col 0-440px, 2 cols 440-635px, 3 cols 635px+, 5 cols 1280px+ */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Brand (Manufacturer) */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Gamintojas
            <span className="text-destructive ml-1">*</span>
          </label>
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
          <label className="text-sm font-medium mb-2 block">
            Modelis
            <span className="text-destructive ml-1">*</span>
          </label>
          <MultiSelectDropdown
            options={models}
            selected={filters.carModel || []}
            onChange={(selected) => onFiltersChange({ carModel: selected })}
            placeholder="Visi"
            searchable={true}
            searchPlaceholder="Ieškoti modelių..."
          />
        </div>

        {/* Engine Capacity */}
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
      </div>
    </div>
  );
};

