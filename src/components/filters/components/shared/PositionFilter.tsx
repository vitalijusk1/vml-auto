import { useBackendFilters } from "@/hooks/useBackendFilters";
import { FilterOption } from "@/types";
import { FilterDropdown } from "./FilterDropdown";

interface PositionFilterProps {
  label?: string;
  selected: FilterOption[];
  onChange: (selected: FilterOption[]) => void;
}

export const PositionFilter = ({
  label = "Padėtis",
  selected,
  onChange,
}: PositionFilterProps) => {
  const { positions } = useBackendFilters();

  return (
    <FilterDropdown
      label={label}
      options={positions}
      selected={selected}
      onChange={onChange}
      searchPlaceholder="Ieškoti padėčių..."
    />
  );
};
