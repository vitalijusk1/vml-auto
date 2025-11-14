import { ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterSectionProps {
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  hasSelection?: boolean;
  selectionCount?: number;
}

export function FilterSection({
  title,
  isExpanded,
  onToggle,
  children,
  hasSelection = false,
  selectionCount = 0,
}: FilterSectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <button
          onClick={onToggle}
          className={cn(
            "flex w-full items-center justify-between rounded-md px-2 py-1.5 transition-colors",
            hasSelection
              ? "bg-primary/10 hover:bg-primary/20 border border-primary/30"
              : "hover:bg-accent/50"
          )}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">{title}</span>
            {hasSelection && selectionCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {selectionCount}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {/* Border line with 24px gap */}
        <div className="mt-6 border-t border-border" />
      </div>
      {isExpanded && <div>{children}</div>}
    </div>
  );
}

