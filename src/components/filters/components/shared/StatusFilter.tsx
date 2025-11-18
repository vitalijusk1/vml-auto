import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { PartStatus } from "@/types";

interface StatusFilterProps {
  label?: string;
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export const StatusFilter = ({
  label = "Būsena",
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
      />
    </div>
  );
};

