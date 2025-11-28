import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { FilterOption } from "@/types";

interface BrandFilterProps {
  label?: string;
  required?: boolean;
  selected: FilterOption[];
  onChange: (selected: FilterOption[]) => void;
  onModelChange?: (models: FilterOption[]) => void; // Optional callback to clear models when brand changes
  singleSelect?: boolean; // If true, only allow one selection
}

export const BrandFilter = ({
  label = "Gamintojas",
  required = false,
  selected,
  onChange,
  onModelChange,
  singleSelect = false,
}: BrandFilterProps) => {
  const { brands } = useBackendFilters();

  const handleChange = (newSelected: FilterOption[]) => {
    // If singleSelect, only keep the last selected item
    const finalSelection =
      singleSelect && newSelected.length > 1
        ? [newSelected[newSelected.length - 1]]
        : newSelected;
    // Call onChange to update brands
    onChange(finalSelection);
    // Clear models when brands change - only call if onModelChange is provided
    // Note: PartFilters already clears models in onChange, so this is mainly
    // for other components that use BrandFilter
    if (onModelChange) {
      onModelChange([]);
    }
  };

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <MultiSelectDropdown
        options={brands}
        selected={selected}
        onChange={handleChange}
        placeholder="Visi"
        searchable={true}
        searchPlaceholder="Ieškoti gamintojų..."
        getDisplayValue={(item) => item.name}
        getValue={(item) => item.id}
      />
    </div>
  );
};
