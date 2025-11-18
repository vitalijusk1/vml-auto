import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { useBackendFilters } from "@/hooks/useBackendFilters";

interface BodyTypeFilterProps {
  label?: string;
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const BodyTypeFilter = ({
  label = "Kėbulo tipas",
  selected,
  onChange,
}: BodyTypeFilterProps) => {
  const { bodyTypes } = useBackendFilters();

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <MultiSelectDropdown
        options={bodyTypes}
        selected={selected}
        onChange={onChange}
        placeholder="Visi"
        searchable={true}
        searchPlaceholder="Ieškoti kėbulo tipų..."
      />
    </div>
  );
};

