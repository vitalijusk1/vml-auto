import { PaginationState } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageSizeSelectorProps {
  pagination: PaginationState;
  onPageSizeChange: (pageSize: number) => void;
  options?: number[];
  className?: string;
}

export function PageSizeSelector({
  pagination,
  onPageSizeChange,
  options = [10, 25, 50, 100],
  className,
}: PageSizeSelectorProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <label className="text-sm text-muted-foreground whitespace-nowrap">
        Rodyti:
      </label>
      <div className="relative">
        <select
          value={pagination.pageSize.toString()}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
          }}
          className="appearance-none flex h-10 w-20 rounded-md border border-input bg-background pl-3 pr-8 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {options.map((option) => (
            <option key={option} value={option.toString()}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none text-muted-foreground" />
      </div>
    </div>
  );
}
