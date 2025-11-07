import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { FilterOption } from "@/utils/filterCars";
import { DynamicInputRow } from "@/components/ui/DynamicInputRow";

interface WheelsSectionProps {
  wheels: {
    wheels?: FilterOption[];
    wheel_drives?: FilterOption[];
    wheels_fixing_points?: FilterOption[];
    wheels_spacing?: FilterOption[];
    wheels_central_diameter?: FilterOption[];
    wheels_width?: FilterOption[];
    wheels_height?: FilterOption[];
    wheels_tread_depth?: FilterOption[];
  };
  selectedFilters: Record<string, string[]>;
  onFilterChange: (filterKey: string, selected: string[]) => void;
}

export function WheelsSection({
  wheels,
  selectedFilters,
  onFilterChange,
}: WheelsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const hasWheels = wheels && Object.keys(wheels).length > 0;

  if (!hasWheels) {
    return null;
  }

  // Helper to get display name from FilterOption
  const getOptionName = (option: FilterOption): string => {
    return option.languages?.en || option.name;
  };

  // Helper to convert FilterOption[] to string[] for MultiSelectDropdown
  const getOptions = (options?: FilterOption[]): string[] => {
    if (!options || !Array.isArray(options)) return [];
    return options.map(getOptionName);
  };

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 hover:bg-accent/50 transition-colors"
      >
        <h3 className="text-sm font-semibold text-foreground">Wheels</h3>
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
                  options={getOptions(wheels.wheels)}
                  selected={selectedFilters.wheels || []}
                  onChange={(selected) => onFilterChange("wheels", selected)}
                  placeholder="Select wheel side"
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
                  options={getOptions(wheels.wheel_drives)}
                  selected={selectedFilters.wheel_drives || []}
                  onChange={(selected) =>
                    onFilterChange("wheel_drives", selected)
                  }
                  placeholder="Select wheel drive"
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
                    options={getOptions(wheels.wheels_fixing_points)}
                    selected={selectedFilters.wheels_fixing_points || []}
                    onChange={(selected) =>
                      onFilterChange("wheels_fixing_points", selected)
                    }
                    placeholder="Select fixing points"
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
                  options={getOptions(wheels.wheels_spacing)}
                  selected={selectedFilters.wheels_spacing || []}
                  onChange={(selected) =>
                    onFilterChange("wheels_spacing", selected)
                  }
                  placeholder="Select spacing"
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
                    options={getOptions(wheels.wheels_central_diameter)}
                    selected={selectedFilters.wheels_central_diameter || []}
                    onChange={(selected) =>
                      onFilterChange("wheels_central_diameter", selected)
                    }
                    placeholder="Select central diameter"
                  />
                </div>
              )}

            {/* Width */}
            {wheels.wheels_width && wheels.wheels_width.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Width</label>
                <MultiSelectDropdown
                  options={getOptions(wheels.wheels_width)}
                  selected={selectedFilters.wheels_width || []}
                  onChange={(selected) =>
                    onFilterChange("wheels_width", selected)
                  }
                  placeholder="Select width"
                />
              </div>
            )}

            {/* Height */}
            {wheels.wheels_height && wheels.wheels_height.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">Height</label>
                <MultiSelectDropdown
                  options={getOptions(wheels.wheels_height)}
                  selected={selectedFilters.wheels_height || []}
                  onChange={(selected) =>
                    onFilterChange("wheels_height", selected)
                  }
                  placeholder="Select height"
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
                    options={getOptions(wheels.wheels_tread_depth)}
                    selected={selectedFilters.wheels_tread_depth || []}
                    onChange={(selected) =>
                      onFilterChange("wheels_tread_depth", selected)
                    }
                    placeholder="Select tread depth"
                  />
                </div>
              )}
          </DynamicInputRow>
        </div>
      )}
    </div>
  );
}
