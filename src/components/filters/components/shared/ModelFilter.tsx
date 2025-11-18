import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";
import { useMemo } from "react";

interface ModelFilterProps {
  label?: string;
  required?: boolean;
  selected: string[];
  selectedBrands: string[];
  onChange: (selected: string[]) => void;
}

export const ModelFilter = ({
  label = "Modelis",
  required = false,
  selected,
  selectedBrands,
  onChange,
}: ModelFilterProps) => {
  const backendFilters = useAppSelector(selectBackendFilters);
  const { models: allModels } = useBackendFilters();

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
    if (!selectedBrands || selectedBrands.length === 0) {
      const allModelsFromBrands: string[] = [];
      for (const brand of backendFiltersData.car.brands) {
        if (brand.models && Array.isArray(brand.models)) {
          const brandModels = brand.models.map((model: any) => {
            return model.name || String(model);
          });
          allModelsFromBrands.push(...brandModels);
        }
      }
      return [...new Set(allModelsFromBrands)]; // Remove duplicates
    }

    // Get selected brand names and find matching brands
    const modelsByBrand: string[] = [];

    for (const brand of backendFiltersData.car.brands) {
      // Extract brand name
      const brandName =
        typeof brand === "string"
          ? brand
          : brand.languages?.en || brand.languages?.name || brand.name;

      // Check if this brand is selected
      if (selectedBrands.includes(brandName)) {
        // Extract models from this brand
        if (brand.models && Array.isArray(brand.models)) {
          const brandModels = brand.models.map((model: any) => {
            return model.name || String(model);
          });
          modelsByBrand.push(...brandModels);
        }
      }
    }

    // Return unique models from selected brands
    return [...new Set(modelsByBrand)];
  }, [allModels, selectedBrands, backendFilters]);

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <MultiSelectDropdown
        options={models}
        selected={selected}
        onChange={onChange}
        placeholder="Visi"
        searchable={true}
        searchPlaceholder="Ieškoti modelių..."
      />
    </div>
  );
};
