import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { FuelType } from "@/types";

interface FuelTypeFilterProps {
  label?: string;
  selected: string[];
  onChange: (selected: string[]) => void;
  useBackendOptions?: boolean; // If true, use backend filters; if false, use hardcoded options
}

export const FuelTypeFilter = ({
  label = "Kuro tipas",
  selected,
  onChange,
  useBackendOptions = true,
}: FuelTypeFilterProps) => {
  const { fuelTypes } = useBackendFilters();

  // Hardcoded options for OrderManagementFilters
  const hardcodedOptions: FuelType[] = [
    "Petrol",
    "Diesel",
    "Electric",
    "Hybrid",
  ];

  const options = useBackendOptions ? fuelTypes : hardcodedOptions;

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <MultiSelectDropdown
        options={options}
        selected={selected}
        onChange={onChange}
        placeholder="Visi"
        searchable={true}
        searchPlaceholder="Ieškoti kuro tipų..."
      />
    </div>
  );
};
