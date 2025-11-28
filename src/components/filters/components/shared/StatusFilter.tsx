import { useBackendFilters } from "@/hooks/useBackendFilters";
import { FilterOption } from "@/types";
import { FilterDropdown } from "./FilterDropdown";

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
    <FilterDropdown
      label={label}
      options={statuses}
      selected={selected}
      onChange={onChange}
      placeholder={placeholder}
      searchPlaceholder="Ieškoti būsenų..."
      useRrrId={true}
    />
  );
};
