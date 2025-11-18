import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { PartPosition } from "@/types";

interface PositionFilterProps {
  label?: string;
  selected: string[];
  onChange: (selected: string[]) => void;
}

export const PositionFilter = ({
  label = "Padėtis",
  selected,
  onChange,
}: PositionFilterProps) => {
  const { positions } = useBackendFilters();

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <MultiSelectDropdown
        options={positions}
        selected={selected}
        onChange={onChange}
        placeholder="Visi"
        searchable={true}
        searchPlaceholder="Ieškoti padėčių..."
      />
    </div>
  );
};

