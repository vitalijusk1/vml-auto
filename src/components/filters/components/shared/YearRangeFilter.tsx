import { SingleSelectDropdown } from "@/components/ui/SingleSelectDropdown";

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
  const yearOptions = Array.from(
    { length: new Date().getFullYear() - 1959 },
    (_, i) => {
      const year = new Date().getFullYear() - i;
      return { value: year.toString(), label: year.toString() };
    }
  );

  return (
    <div>
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <div className="grid grid-cols-2 gap-2">
        <SingleSelectDropdown
          options={[{ value: "", label: "Nuo" }, ...yearOptions]}
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
          options={[{ value: "", label: "Iki" }, ...yearOptions]}
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
