import { Select } from "@/components/ui/select";
import { PaginationState } from "@tanstack/react-table";

interface PageSizeSelectorProps {
  pagination: PaginationState;
  onPageSizeChange: (pageSize: number) => void;
  options?: number[];
  className?: string;
}

export function PageSizeSelector({
  pagination,
  onPageSizeChange,
  options = [10, 25, 50, 100, 250],
  className,
}: PageSizeSelectorProps) {
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <label className="text-sm text-muted-foreground whitespace-nowrap">
        Show:
      </label>
      <Select
        value={pagination.pageSize.toString()}
        onChange={(e) => {
          onPageSizeChange(Number(e.target.value));
        }}
        className="w-20"
      >
        {options.map((option) => (
          <option key={option} value={option.toString()}>
            {option}
          </option>
        ))}
      </Select>
    </div>
  );
}
