import { useState, useMemo } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { DynamicInputRow } from "@/components/ui/DynamicInputRow";
import { cn } from "@/lib/utils";

interface WheelsSectionProps {
  wheels: {
    wheels?: string[];
    wheel_drives?: string[];
    wheels_fixing_points?: string[];
    wheels_spacing?: string[];
    wheels_central_diameter?: string[];
    wheels_width?: string[];
    wheels_height?: string[];
    wheels_tread_depth?: string[];
  };
  selectedFilters: Record<string, string[]>;
  onFilterChange: (filterKey: string, selected: string[]) => void;
}

export function WheelsSection({
  wheels,
  selectedFilters,
  onFilterChange,
}: WheelsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasWheels = wheels && Object.keys(wheels).length > 0;

  // Count total selected wheel filters
  const selectedCount = useMemo(() => {
    return Object.values(selectedFilters).reduce(
      (total, selected) => total + (selected?.length || 0),
      0
    );
  }, [selectedFilters]);

  const hasSelection = selectedCount > 0;

  if (!hasWheels) {
    return null;
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "flex w-full items-center justify-between rounded-md px-2 py-1.5 transition-colors",
          hasSelection
            ? "bg-primary/10 hover:bg-primary/20 border border-primary/30"
            : "hover:bg-accent/50"
        )}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Wheels</h3>
          {hasSelection && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
              {selectedCount}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {isExpanded && (
        <div className="pl-2">
          <DynamicInputRow gap={4} maxPerRow={4}>
            {/* Wheels */}
            {wheels.wheels && wheels.wheels.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Wheel Side
                </label>
                <MultiSelectDropdown
                  options={wheels.wheels}
                  selected={selectedFilters.wheels || []}
                  onChange={(selected) => onFilterChange("wheels", selected)}
                  placeholder="Select wheel side"
                  searchable={true}
                  searchPlaceholder="Search wheel side..."
                />
              </div>
            )}

            {/* Wheel Drives */}
            {wheels.wheel_drives && wheels.wheel_drives.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Wheel Drive
                </label>
                <MultiSelectDropdown
                  options={wheels.wheel_drives}
                  selected={selectedFilters.wheel_drives || []}
                  onChange={(selected) =>
                    onFilterChange("wheel_drives", selected)
                  }
                  placeholder="Select wheel drive"
                  searchable={true}
                  searchPlaceholder="Search wheel drive..."
                />
              </div>
            )}

            {/* Fixing Points */}
            {wheels.wheels_fixing_points &&
              wheels.wheels_fixing_points.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Fixing Points
                  </label>
                  <MultiSelectDropdown
                    options={wheels.wheels_fixing_points}
                    selected={selectedFilters.wheels_fixing_points || []}
                    onChange={(selected) =>
                      onFilterChange("wheels_fixing_points", selected)
                    }
                    placeholder="Select fixing points"
                    searchable={true}
                    searchPlaceholder="Search fixing points..."
                  />
                </div>
              )}

            {/* Spacing */}
            {wheels.wheels_spacing && wheels.wheels_spacing.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Spacing
                </label>
                <MultiSelectDropdown
                  options={wheels.wheels_spacing}
                  selected={selectedFilters.wheels_spacing || []}
                  onChange={(selected) =>
                    onFilterChange("wheels_spacing", selected)
                  }
                  placeholder="Select spacing"
                  searchable={true}
                  searchPlaceholder="Search spacing..."
                />
              </div>
            )}

            {/* Central Diameter */}
            {wheels.wheels_central_diameter &&
              wheels.wheels_central_diameter.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Central Diameter
                  </label>
                  <MultiSelectDropdown
                    options={wheels.wheels_central_diameter}
                    selected={selectedFilters.wheels_central_diameter || []}
                    onChange={(selected) =>
                      onFilterChange("wheels_central_diameter", selected)
                    }
                    placeholder="Select central diameter"
                    searchable={true}
                    searchPlaceholder="Search central diameter..."
                  />
                </div>
              )}

            {/* Width */}
            {wheels.wheels_width && wheels.wheels_width.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Width</label>
                <MultiSelectDropdown
                  options={wheels.wheels_width}
                  selected={selectedFilters.wheels_width || []}
                  onChange={(selected) =>
                    onFilterChange("wheels_width", selected)
                  }
                  placeholder="Select width"
                  searchable={true}
                  searchPlaceholder="Search width..."
                />
              </div>
            )}

            {/* Height */}
            {wheels.wheels_height && wheels.wheels_height.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Height</label>
                <MultiSelectDropdown
                  options={wheels.wheels_height}
                  selected={selectedFilters.wheels_height || []}
                  onChange={(selected) =>
                    onFilterChange("wheels_height", selected)
                  }
                  placeholder="Select height"
                  searchable={true}
                  searchPlaceholder="Search height..."
                />
              </div>
            )}

            {/* Tread Depth */}
            {wheels.wheels_tread_depth &&
              wheels.wheels_tread_depth.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Tread Depth
                  </label>
                  <MultiSelectDropdown
                    options={wheels.wheels_tread_depth}
                    selected={selectedFilters.wheels_tread_depth || []}
                    onChange={(selected) =>
                      onFilterChange("wheels_tread_depth", selected)
                    }
                    placeholder="Select tread depth"
                    searchable={true}
                    searchPlaceholder="Search tread depth..."
                  />
                </div>
              )}
          </DynamicInputRow>
        </div>
      )}
    </div>
  );
}
