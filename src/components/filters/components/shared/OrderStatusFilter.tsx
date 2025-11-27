import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { FilterOption } from "@/types";

// Hardcoded order statuses (not from backend)
const ORDER_STATUSES: FilterOption[] = [
  { id: 1, name: "SENT", rrr_id: "SENT" },
  { id: 2, name: "PREPARED", rrr_id: "PREPARED" },
  { id: 3, name: "NEW", rrr_id: "NEW" },
  { id: 4, name: "CANCELLED", rrr_id: "CANCELLED" },
];

interface OrderStatusFilterProps {
  label?: string;
  selected: FilterOption[];
  onChange: (selected: FilterOption[]) => void;
  placeholder?: string;
}

export const OrderStatusFilter = ({
  label = "Statusas",
  selected,
  onChange,
  placeholder = "Visi",
}: OrderStatusFilterProps) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <MultiSelectDropdown
        options={ORDER_STATUSES}
        selected={selected}
        onChange={onChange}
        placeholder={placeholder}
        searchable={true}
        searchPlaceholder="Ieškoti būsenų..."
        getDisplayValue={(item) => item.name}
        getValue={(item) => item.rrr_id ?? item.id}
      />
    </div>
  );
};
