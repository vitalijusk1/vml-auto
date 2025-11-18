import { Input } from "@/components/ui/input";

interface TableFilterProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TableFilter({
  value,
  onChange,
  placeholder = "Filtruoti lentelę...",
  className,
}: TableFilterProps) {
  return (
    <Input
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className || "max-w-sm"}
    />
  );
}
