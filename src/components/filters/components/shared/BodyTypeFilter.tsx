import { useBackendFilters } from "@/hooks/useBackendFilters";
import { FilterOption } from "@/types";
import { FilterDropdown } from "./FilterDropdown";

interface BodyTypeFilterProps {
  label?: string;
  selected: FilterOption[];
  onChange: (selected: FilterOption[]) => void;
}

export const BodyTypeFilter = ({
  label = "Kėbulo tipas",
  selected,
  onChange,
}: BodyTypeFilterProps) => {
  const { bodyTypes } = useBackendFilters();

  return (
    <FilterDropdown
      label={label}
      options={bodyTypes}
      selected={selected}
      onChange={onChange}
      searchPlaceholder="Ieškoti kėbulo tipų..."
    />
  );
};
