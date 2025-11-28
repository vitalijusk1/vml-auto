import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";
import { useMemo } from "react";
import { FilterOption } from "@/types";
import { getLocalizedText } from "@/utils/i18n";

interface ModelFilterProps {
  label?: string;
  required?: boolean;
  selected: FilterOption[];
  selectedBrands: FilterOption[];
  onChange: (selected: FilterOption[]) => void;
  singleSelect?: boolean; // If true, only allow one selection
}

export const ModelFilter = ({
  label = "Modelis",
  required = false,
  selected,
  selectedBrands,
  onChange,
  singleSelect = false,
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

    // Helper to extract models from brands
    const extractModelsFromBrands = (
      brands: any[],
      filterByBrandIds?: Set<number>
    ): FilterOption[] => {
      const modelsMap = new Map<number, FilterOption>();
      for (const brand of brands) {
        const brandId = typeof brand === "object" ? brand.id : null;
        // Skip if filtering by brand IDs and this brand isn't selected
        if (
          filterByBrandIds &&
          (brandId === null || !filterByBrandIds.has(brandId))
        ) {
          continue;
        }
        if (brand.models && Array.isArray(brand.models)) {
          for (const model of brand.models) {
            if (model && typeof model === "object" && model.id !== undefined) {
              const name = getLocalizedText(
                model.languages,
                model.name || String(model.id)
              );
              modelsMap.set(model.id, {
                name,
                id: model.id,
                rrr_id: model.rrr_id,
              });
            }
          }
        }
      }
      return Array.from(modelsMap.values());
    };

    // If no brands selected, return all models; otherwise filter by selected brands
    return extractModelsFromBrands(
      backendFiltersData.car.brands,
      selectedBrandIdsSet.size > 0 ? selectedBrandIdsSet : undefined
    );
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
        onChange={(newSelected) => {
          // If singleSelect, only keep the last selected item
          const finalSelection =
            singleSelect && newSelected.length > 1
              ? [newSelected[newSelected.length - 1]]
              : newSelected;
          onChange(finalSelection);
        }}
        placeholder="Visi"
        searchable={true}
        searchPlaceholder="Ieškoti modelių..."
        getDisplayValue={(item) => item.name}
        getValue={(item) => item.id}
      />
    </div>
  );
};
