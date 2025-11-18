import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { useBackendFilters } from "@/hooks/useBackendFilters";

interface BrandFilterProps {
  label?: string;
  required?: boolean;
  selected: string[];
  onChange: (selected: string[]) => void;
  onModelChange?: (models: string[]) => void; // Optional callback to clear models when brand changes
}

export const BrandFilter = ({
  label = "Gamintojas",
  required = false,
  selected,
  onChange,
  onModelChange,
}: BrandFilterProps) => {
  const { brands } = useBackendFilters();

  const handleChange = (newSelected: string[]) => {
    onChange(newSelected);
    // Clear models when brands change
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
      />
    </div>
  );
};
