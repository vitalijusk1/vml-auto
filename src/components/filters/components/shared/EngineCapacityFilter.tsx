import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";

interface EngineCapacityFilterProps {
  label?: string;
  selected: string[];
  onChange: (selected: string[]) => void;
}

const ENGINE_CAPACITY_OPTIONS = [
  "800",
  "1000",
  "1200",
  "1400",
  "1600",
  "1800",
  "2000",
  "2200",
  "2400",
  "2600",
  "2800",
  "3000",
  "3200",
  "3500",
  "4000",
  "4500",
  "5000",
];

export const EngineCapacityFilter = ({
  label = "Variklio tūris",
  selected,
  onChange,
}: EngineCapacityFilterProps) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <MultiSelectDropdown
        options={ENGINE_CAPACITY_OPTIONS}
        selected={selected}
        onChange={onChange}
        placeholder="Visi"
        searchable={true}
        searchPlaceholder="Ieškoti variklio tūrių..."
      />
    </div>
  );
};
