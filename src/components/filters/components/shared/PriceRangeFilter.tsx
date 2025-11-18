import { SingleSelectDropdown } from "@/components/ui/SingleSelectDropdown";

interface PriceRangeFilterProps {
  label?: string;
  min?: number;
  max?: number;
  onChange: (range: { min?: number; max?: number }) => void;
}

const PRICE_OPTIONS = [
  { value: "", label: "Nuo" },
  { value: "0", label: "0" },
  { value: "10", label: "10" },
  { value: "25", label: "25" },
  { value: "50", label: "50" },
  { value: "100", label: "100" },
  { value: "250", label: "250" },
  { value: "500", label: "500" },
  { value: "1000", label: "1000" },
  { value: "2500", label: "2500" },
  { value: "5000", label: "5000" },
  { value: "10000", label: "10000" },
  { value: "25000", label: "25000" },
  { value: "50000", label: "50000" },
];

const MAX_PRICE_OPTIONS = [
  ...PRICE_OPTIONS.slice(1), // Skip the "Nuo" option
  { value: "100000", label: "100000+" },
];

export const PriceRangeFilter = ({
  label = "Kainos pasirinkimas",
  min,
  max,
  onChange,
}: PriceRangeFilterProps) => {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <div className="grid grid-cols-2 gap-2">
      <SingleSelectDropdown
        options={PRICE_OPTIONS}
        value={min?.toString() || ""}
        onChange={(value: string) =>
          onChange({
            min: value ? parseFloat(value) : undefined,
            max,
          })
        }
        placeholder="Nuo"
        className="[&>button]:h-10"
      />
      <SingleSelectDropdown
        options={[
          { value: "", label: "Iki" },
          ...MAX_PRICE_OPTIONS,
        ]}
        value={max?.toString() || ""}
        onChange={(value: string) =>
          onChange({
            min,
            max: value ? parseFloat(value) : undefined,
          })
        }
        placeholder="Iki"
        className="[&>button]:h-10"
      />
      </div>
    </div>
  );
};

