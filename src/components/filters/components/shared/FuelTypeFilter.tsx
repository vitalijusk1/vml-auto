import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { FilterOption } from "@/types";
import { getLocalizedText } from "@/utils/i18n";

interface FuelTypeFilterProps {
  label?: string;
  selected: FilterOption[];
  onChange: (selected: FilterOption[]) => void;
  useBackendOptions?: boolean; // If true, use backend filters; if false, use hardcoded options
}

export const FuelTypeFilter = ({
  label = "Kuro tipas",
  selected,
  onChange,
  useBackendOptions = true,
}: FuelTypeFilterProps) => {
  const { fuelTypes } = useBackendFilters();

  // Hardcoded options for OrderManagementFilters - convert to FilterOption[]
  // Using negative IDs to indicate these are not from backend
  const hardcodedOptions: FilterOption[] = [
    { name: "Petrol", id: -1 },
    { name: "Diesel", id: -2 },
    { name: "Electric", id: -3 },
    { name: "Hybrid", id: -4 },
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
        getDisplayValue={(item: any) =>
          item.languages ? getLocalizedText(item.languages, item.name) : item.name
        }
        getValue={(item) => item.id}
      />
    </div>
  );
};
