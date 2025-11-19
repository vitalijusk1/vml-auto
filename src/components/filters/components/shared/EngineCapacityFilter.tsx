import { SingleSelectDropdown } from "@/components/ui/SingleSelectDropdown";
import { useEffect } from "react";

interface EngineCapacityFilterProps {
  label?: string;
  min?: number;
  max?: number;
  onChange: (range: { min?: number; max?: number }) => void;
}

const ENGINE_CAPACITY_OPTIONS = [
  { value: "800", label: "800" },
  { value: "1000", label: "1000" },
  { value: "1200", label: "1200" },
  { value: "1400", label: "1400" },
  { value: "1600", label: "1600" },
  { value: "1800", label: "1800" },
  { value: "2000", label: "2000" },
  { value: "2200", label: "2200" },
  { value: "2400", label: "2400" },
  { value: "2600", label: "2600" },
  { value: "2800", label: "2800" },
  { value: "3000", label: "3000" },
  { value: "3200", label: "3200" },
  { value: "3500", label: "3500" },
  { value: "4000", label: "4000" },
  { value: "4500", label: "4500" },
  { value: "5000", label: "5000" },
];

const MAX_ENGINE_CAPACITY_OPTIONS = [
  ...ENGINE_CAPACITY_OPTIONS,
  { value: "6000", label: "6000+" },
];

export const EngineCapacityFilter = ({
  label = "Variklio tūris",
  min,
  max,
  onChange,
}: EngineCapacityFilterProps) => {
  // Auto-correct invalid range: if min > max, clear max
  useEffect(() => {
    if (min !== undefined && max !== undefined && min > max) {
      onChange({ min, max: undefined });
    }
  }, [min, max, onChange]);

  // Filter options for "from" - only show values <= max (if max is set)
  const fromOptions = max !== undefined
    ? ENGINE_CAPACITY_OPTIONS.filter(
        (opt) => parseInt(opt.value) <= max
      )
    : ENGINE_CAPACITY_OPTIONS;

  // Filter options for "to" - only show values >= min (if min is set)
  const toOptions = min !== undefined
    ? MAX_ENGINE_CAPACITY_OPTIONS.filter(
        (opt) => opt.value === "" || parseInt(opt.value) >= min
      )
    : MAX_ENGINE_CAPACITY_OPTIONS;

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
