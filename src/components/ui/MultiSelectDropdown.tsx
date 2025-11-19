import * as React from "react";
import { Button } from "./button";
import { Input } from "./input";
import { ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectDropdownProps<T extends string> {
  options: T[];
  selected: T[];
  onChange: (selected: T[]) => void;
  placeholder?: string;
  className?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function MultiSelectDropdown<T extends string>({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
  searchable = false,
  searchPlaceholder = "Search...",
}: MultiSelectDropdownProps<T>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Normalize function - moved outside to avoid recreating on every render
  const normalize = React.useCallback((val: T | string): string => {
    const str = String(val).trim();
    // Try to normalize numbers (e.g., "10.0" -> "10")
    const num = Number(str);
    if (!isNaN(num) && isFinite(num)) {
      return String(num);
    }
    return str;
  }, []);

  // Memoize selected items as a Set for O(1) lookups
  const selectedSet = React.useMemo(() => {
    return new Set(selected.map(normalize));
  }, [selected, normalize]);

  const toggleOption = (option: T) => {
    const normalizedOption = normalize(option);
    const isSelected = selectedSet.has(normalizedOption);

    if (isSelected) {
      // Remove all instances of this option (in case of duplicates)
      onChange(selected.filter((item) => normalize(item) !== normalizedOption));
    } else {
      // Add the option only if it's not already selected
      if (!selectedSet.has(normalizedOption)) {
        onChange([...selected, option]);
      }
    }
  };

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchable || !searchQuery.trim()) {
      return options;
    }
    const query = searchQuery.toLowerCase();
    return options.filter((option) => option.toLowerCase().includes(query));
  }, [options, searchQuery, searchable]);

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      // Small delay to ensure the dropdown is rendered
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  }, [isOpen, searchable]);

  // Clear search when dropdown closes
  React.useEffect(() => {
    if (!isOpen) {
      setSearchQuery("");
    }
  }, [isOpen]);

  const displayText =
    selected.length === 0
      ? placeholder
      : selected.length === 1
      ? selected[0]
      : `${selected.length} selected`;

  const hasSelection = selected.length > 0;

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <Button
        type="button"
        variant={hasSelection ? "default" : "outline"}
        className={cn(
          "w-full justify-between",
          hasSelection &&
            "bg-primary text-primary-foreground hover:bg-primary/90"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{displayText}</span>
        <div className="flex items-center gap-1">
          {hasSelection && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-foreground/20 text-xs font-medium">
              {selected.length}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </Button>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border border-border bg-background shadow-lg overflow-hidden"
          onMouseDown={(e) => {
            // Prevent click-outside handler from closing dropdown when clicking inside
            e.stopPropagation();
          }}
        >
          {searchable && (
            <div className="sticky top-0 z-10 border-b border-border bg-background py-2 -mx-[1px] px-[calc(0.5rem+1px)]">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-8 h-8"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onKeyDown={(e) => {
                      // Prevent closing dropdown when typing
                      e.stopPropagation();
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {hasSelection && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 shrink-0 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange([]);
                    }}
                    title="Clear selection"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          )}
          {!searchable && hasSelection && (
            <div className="border-b border-border bg-background py-2 -mx-[1px] px-[calc(0.5rem+1px)]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full h-8 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
                onMouseDown={(e) => e.stopPropagation()}
                title="Clear selection"
              >
                Clear
              </Button>
            </div>
          )}
          <div
            className="max-h-60 overflow-auto p-1"
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              // Use CSS containment to improve rendering performance
              contain: "layout style paint",
            }}
          >
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                {searchQuery ? "No results found" : "No options available"}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const normalizedOption = normalize(option);
                const isSelected = selectedSet.has(normalizedOption);

                return (
                  <div
                    key={option}
                    className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
                    onMouseDown={(e) => {
                      // Prevent the dropdown from closing when clicking on options
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      // Only toggle if clicking on the div itself, not the checkbox
                      // (checkbox has its own onChange handler)
                      if (
                        e.target === e.currentTarget ||
                        (e.target as HTMLElement).tagName === "SPAN"
                      ) {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleOption(option);
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleOption(option);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      className="rounded"
                    />
                    <span className="flex-1">{option}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
