import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";
import { useMemo } from "react";
import { FilterOption } from "@/types";

interface ModelFilterProps {
  label?: string;
  required?: boolean;
  selected: FilterOption[];
  selectedBrands: FilterOption[];
  onChange: (selected: FilterOption[]) => void;
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

    // Create a Set for faster brand ID lookups
    const selectedBrandIdsSet = new Set(selectedBrands.map((b) => b.id));

    // If no brands selected, return all models from all brands
    if (selectedBrandIdsSet.size === 0) {
      const allModelsFromBrands = new Map<number, FilterOption>();
      for (const brand of backendFiltersData.car.brands) {
        if (brand.models && Array.isArray(brand.models)) {
          for (const model of brand.models) {
            if (model && typeof model === "object" && model.id !== undefined) {
              // Extract name - prioritize Lithuanian, fallback to English, then name property
              let name = "";
              if (model.languages?.lt) {
                name = model.languages.lt;
              } else if (model.languages?.en) {
                name = model.languages.en;
              } else if (model.languages?.name) {
                name = model.languages.name;
              } else if (model.name) {
                name = model.name;
              } else {
                name = String(model.id);
              }
              // Use Map to deduplicate by ID
              allModelsFromBrands.set(model.id, {
                name,
                id: model.id,
                rrr_id: model.rrr_id,
              });
            }
          }
        }
      }
      return Array.from(allModelsFromBrands.values());
    }

    // Get models from selected brands
    const modelsByBrand = new Map<number, FilterOption>();

    for (const brand of backendFiltersData.car.brands) {
      // Extract brand ID
      const brandId =
        typeof brand === "object" && brand.id !== undefined ? brand.id : null;

      // Check if this brand is selected using Set for O(1) lookup
      if (brandId !== null && selectedBrandIdsSet.has(brandId)) {
        // Extract models from this brand
        if (brand.models && Array.isArray(brand.models)) {
          for (const model of brand.models) {
            if (model && typeof model === "object" && model.id !== undefined) {
              // Extract name - prioritize Lithuanian, fallback to English, then name property
              let name = "";
              if (model.languages?.lt) {
                name = model.languages.lt;
              } else if (model.languages?.en) {
                name = model.languages.en;
              } else if (model.languages?.name) {
                name = model.languages.name;
              } else if (model.name) {
                name = model.name;
              } else {
                name = String(model.id);
              }
              // Use Map to deduplicate by ID
              modelsByBrand.set(model.id, {
                name,
                id: model.id,
                rrr_id: model.rrr_id,
              });
            }
          }
        }
      }
    }

    // Return unique models from selected brands
    return Array.from(modelsByBrand.values());
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
        getDisplayValue={(item) => item.name}
        getValue={(item) => item.id}
      />
    </div>
  );
};
