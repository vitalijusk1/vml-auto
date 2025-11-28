import { useBackendFilters } from "@/hooks/useBackendFilters";
import { FilterOption } from "@/types";
import { FilterDropdown } from "./FilterDropdown";

interface QualityFilterProps {
  label?: string;
  selected: FilterOption[];
  onChange: (selected: FilterOption[]) => void;
}

export const QualityFilter = ({
  label = "Kokybė",
  selected,
  onChange,
}: QualityFilterProps) => {
  const { qualities } = useBackendFilters();

  return (
    <FilterDropdown
      label={label}
      options={qualities}
      selected={selected}
      onChange={onChange}
      searchPlaceholder="Ieškoti kokybių..."
      useRrrId={true}
    />
  );
};
