import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { FilterOption } from "@/types";

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
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <MultiSelectDropdown
        options={qualities}
        selected={selected}
        onChange={onChange}
        placeholder="Visi"
        searchable={true}
        searchPlaceholder="Ieškoti kokybių..."
        getDisplayValue={(item) => item.name}
        getValue={(item) => item.id}
      />
    </div>
  );
};

