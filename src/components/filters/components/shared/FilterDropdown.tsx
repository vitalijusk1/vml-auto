import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { FilterOption } from "@/types";

export type FilterType =
  | "brand"
  | "model"
  | "bodyType"
  | "fuelType"
  | "quality"
  | "position"
  | "status";

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selected: FilterOption[];
  onChange: (selected: FilterOption[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  required?: boolean;
  // Use rrr_id for getValue (for status, quality filters)
  useRrrId?: boolean;
}

/**
 * Generic filter dropdown component that replaces duplicate filter components.
 * Use this for simple multi-select filters that just need options from backend.
 */
export const FilterDropdown = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Visi",
  searchPlaceholder = "Ieškoti...",
  required = false,
  useRrrId = false,
}: FilterDropdownProps) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      <MultiSelectDropdown
        options={options}
        selected={selected}
        onChange={onChange}
        placeholder={placeholder}
        searchable={true}
        searchPlaceholder={searchPlaceholder}
        getDisplayValue={(item) => item.name}
        getValue={(item) => (useRrrId ? item.rrr_id ?? item.id : item.id)}
      />
    </div>
  );
};
