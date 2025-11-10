import * as React from "react";
import { Button } from "./button";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SingleSelectDropdownProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SingleSelectDropdown({
  options,
  value,
  onChange,
  placeholder = "Select option...",
  className,
}: SingleSelectDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className={cn("relative w-full", className)} ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown
          className={cn(
            "ml-2 h-4 w-4 shrink-0 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </Button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg">
          <div className="max-h-60 overflow-auto p-1">
            {options.length === 0 ? (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                No options available
              </div>
            ) : (
              options.map((option) => {
                const isSelected = value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left rounded-sm px-2 py-1.5 text-sm cursor-pointer hover:bg-accent transition-colors",
                      isSelected && "bg-accent font-medium"
                    )}
                  >
                    {option.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}




