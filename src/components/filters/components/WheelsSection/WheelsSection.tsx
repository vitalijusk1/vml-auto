import { useState, useMemo } from "react";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { FilterSection } from "../FilterSection/FilterSection";
import { FilterOption } from "@/types";

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
  selectedFilters: Record<string, FilterOption[]>;
  onFilterChange: (filterKey: string, selected: FilterOption[]) => void;
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
    <FilterSection
      title="Ratai"
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded(!isExpanded)}
      hasSelection={hasSelection}
      selectionCount={selectedCount}
    >
      {/* Single grid layout: 1 col 0-440px, 2 cols 440-635px, 3 cols 635px+, 5 cols 1280px+ */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Wheel Side */}
        {wheels.wheels && wheels.wheels.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Rato pusė
            </label>
            <MultiSelectDropdown
              options={wheels.wheels}
              selected={selectedFilters.wheels || []}
              onChange={(selected) => onFilterChange("wheels", selected)}
              placeholder="Visi"
              searchable={true}
              searchPlaceholder="Ieškoti rato pusės..."
              getDisplayValue={(item) => item.name}
              getValue={(item) => item.id}
            />
          </div>
        )}

        {/* Wheel Drive */}
        {wheels.wheel_drives && wheels.wheel_drives.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Varomieji ratai
            </label>
            <MultiSelectDropdown
              options={wheels.wheel_drives}
              selected={selectedFilters.wheel_drives || []}
              onChange={(selected) =>
                onFilterChange("wheel_drives", selected)
              }
              placeholder="Visi"
              searchable={true}
              searchPlaceholder="Ieškoti rato pavaros..."
              getDisplayValue={(item) => item.name}
              getValue={(item) => item.id}
            />
          </div>
        )}

        {/* Fixing Points */}
        {wheels.wheels_fixing_points &&
          wheels.wheels_fixing_points.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Tvirtinimo taškai
              </label>
              <MultiSelectDropdown
                options={wheels.wheels_fixing_points}
                selected={selectedFilters.wheels_fixing_points || []}
                onChange={(selected) =>
                  onFilterChange("wheels_fixing_points", selected)
                }
                placeholder="Visi"
                searchable={true}
                searchPlaceholder="Ieškoti tvirtinimo taškų..."
                getDisplayValue={(item) => item.name}
                getValue={(item) => item.id}
              />
            </div>
          )}

        {/* Spacing */}
        {wheels.wheels_spacing && wheels.wheels_spacing.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Tarpas
            </label>
            <MultiSelectDropdown
              options={wheels.wheels_spacing}
              selected={selectedFilters.wheels_spacing || []}
              onChange={(selected) =>
                onFilterChange("wheels_spacing", selected)
              }
              placeholder="Visi"
              searchable={true}
              searchPlaceholder="Ieškoti tarpo..."
              getDisplayValue={(item) => item.name}
              getValue={(item) => item.id}
            />
          </div>
        )}

        {/* Central Diameter */}
        {wheels.wheels_central_diameter &&
          wheels.wheels_central_diameter.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Centrinis skersmuo
              </label>
              <MultiSelectDropdown
                options={wheels.wheels_central_diameter}
                selected={selectedFilters.wheels_central_diameter || []}
                onChange={(selected) =>
                  onFilterChange("wheels_central_diameter", selected)
                }
                placeholder="Visi"
                searchable={true}
                searchPlaceholder="Ieškoti centrinio skersmens..."
                getDisplayValue={(item) => item.name}
                getValue={(item) => item.id}
              />
            </div>
          )}

        {/* Width */}
        {wheels.wheels_width && wheels.wheels_width.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Plotis</label>
            <MultiSelectDropdown
              options={wheels.wheels_width}
              selected={selectedFilters.wheels_width || []}
              onChange={(selected) =>
                onFilterChange("wheels_width", selected)
              }
              placeholder="Visi"
              searchable={true}
              searchPlaceholder="Ieškoti pločio..."
              getDisplayValue={(item) => item.name}
              getValue={(item) => item.id}
            />
          </div>
        )}

        {/* Height */}
        {wheels.wheels_height && wheels.wheels_height.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">Aukštis</label>
            <MultiSelectDropdown
              options={wheels.wheels_height}
              selected={selectedFilters.wheels_height || []}
              onChange={(selected) =>
                onFilterChange("wheels_height", selected)
              }
              placeholder="Visi"
              searchable={true}
              searchPlaceholder="Ieškoti aukščio..."
              getDisplayValue={(item) => item.name}
              getValue={(item) => item.id}
            />
          </div>
        )}

        {/* Tread Depth */}
        {wheels.wheels_tread_depth &&
          wheels.wheels_tread_depth.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">
                Protektoriaus gylis
              </label>
              <MultiSelectDropdown
                options={wheels.wheels_tread_depth}
                selected={selectedFilters.wheels_tread_depth || []}
                onChange={(selected) =>
                  onFilterChange("wheels_tread_depth", selected)
                }
                placeholder="Visi"
                searchable={true}
                searchPlaceholder="Ieškoti protektoriaus gylio..."
                getDisplayValue={(item) => item.name}
                getValue={(item) => item.id}
              />
            </div>
          )}
      </div>
    </FilterSection>
  );
}
