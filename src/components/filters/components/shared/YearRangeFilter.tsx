import { SingleSelectDropdown } from "@/components/ui/SingleSelectDropdown";
import { useEffect } from "react";

interface YearRangeFilterProps {
  label?: string;
  min?: number;
  max?: number;
  onChange: (range: { min?: number; max?: number }) => void;
}

export const YearRangeFilter = ({
  label = "Metų pasirinkimas",
  min,
  max,
  onChange,
}: YearRangeFilterProps) => {
  // Auto-correct invalid range: if min > max, clear max
  useEffect(() => {
    if (min !== undefined && max !== undefined && min > max) {
      onChange({ min, max: undefined });
    }
  }, [min, max, onChange]);

  const yearOptions = Array.from(
    { length: new Date().getFullYear() - 1959 },
    (_, i) => {
      const year = new Date().getFullYear() - i;
      return { value: year.toString(), label: year.toString() };
    }
  );

  // Filter options for "from" - only show years <= max (if max is set)
  const fromOptions =
    max !== undefined
      ? yearOptions.filter((opt) => parseInt(opt.value) <= max)
      : yearOptions;

  // Filter options for "to" - only show years >= min (if min is set)
  const toOptions =
    min !== undefined
      ? yearOptions.filter((opt) => parseInt(opt.value) >= min)
      : yearOptions;

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <SingleSelectDropdown
          options={[{ value: "", label: "Nuo" }, ...fromOptions]}
          value={min?.toString() || ""}
          onChange={(value: string) =>
            onChange({
              min: value ? parseInt(value) : undefined,
              max,
            })
          }
          placeholder="Nuo"
          className="[&>button]:h-10"
        />
        <SingleSelectDropdown
          options={[{ value: "", label: "Iki" }, ...toOptions]}
          value={max?.toString() || ""}
          onChange={(value: string) =>
            onChange({
              min,
              max: value ? parseInt(value) : undefined,
            })
          }
          placeholder="Iki"
          className="[&>button]:h-10"
        />
      </div>
    </div>
  );
};
