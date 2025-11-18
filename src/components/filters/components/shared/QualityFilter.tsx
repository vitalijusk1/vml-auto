import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { PartQuality } from "@/types";

interface QualityFilterProps {
  label?: string;
  selected: string[];
  onChange: (selected: string[]) => void;
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
      />
    </div>
  );
};

