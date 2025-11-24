import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { FilterOption } from "@/types";

interface StatusFilterProps {
  label?: string;
  selected: FilterOption[];
  onChange: (selected: FilterOption[]) => void;
  placeholder?: string;
}

export const StatusFilter = ({
  label = "Statusas",
  selected,
  onChange,
  placeholder = "Visi",
}: StatusFilterProps) => {
  const { statuses } = useBackendFilters();

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <MultiSelectDropdown
        options={statuses}
        selected={selected}
        onChange={onChange}
        placeholder={placeholder}
        searchable={true}
        searchPlaceholder="Ieškoti būsenų..."
        getDisplayValue={(item) => item.name}
        getValue={(item) => item.id}
      />
    </div>
  );
};
