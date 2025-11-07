import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { SingleSelectDropdown } from "@/components/ui/SingleSelectDropdown";
import { FilterState, PartStatus, BodyType, FuelType } from "@/types";
import { useFilters } from "../useFilters";
import { useAppSelector } from "@/store/hooks";
import { selectParts } from "@/store/selectors";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface PartFiltersProps {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
}

export const PartFilters = ({
  filters,
  onFiltersChange,
  onReset,
}: PartFiltersProps) => {
  const {
    uniqueBrands,
    uniqueModels,
    uniqueBodyTypes,
    uniquePartTypes,
    uniqueWarehouses,
    uniqueGearboxes,
    uniqueFuelTypes,
  } = useFilters(filters);

  const parts = useAppSelector(selectParts);
  const [showBasicFilters, setShowBasicFilters] = useState(true);
  const [showWheelFilters, setShowWheelFilters] = useState(false);

  // Check if wheel filters should be available (if any part is a wheel or wheel filters are selected)
  const hasWheelParts = useMemo(() => {
    // Check if any part in the data is a wheel
    const hasWheelPartsInData = parts.some(
      (p) =>
        p.partType.toLowerCase().includes("wheel") ||
        p.category.toLowerCase().includes("wheel") ||
        p.category.toLowerCase().includes("tire") ||
        p.wheelDrive !== undefined
    );

    // Or if wheel part type/category is selected in filters
    const hasWheelFilters =
      filters.partType?.some((type) => type.toLowerCase().includes("wheel")) ||
      filters.partCategory?.some(
        (cat) =>
          cat.toLowerCase().includes("wheel") ||
          cat.toLowerCase().includes("tire")
      );

    return hasWheelPartsInData || hasWheelFilters;
  }, [parts, filters.partType, filters.partCategory]);

  // Wheel filter options
  const wheelDriveOptions = ["AWD", "RWD", "FWD"];
  const wheelSideOptions = ["Left", "Right"];
  const wheelCentralDiameterOptions = ["57.1", "58.0", "58.1"];
  const wheelFixingPointsOptions = ["3", "4", "5", "6"];
  const wheelHeightOptions = ["25", "30", "35"];
  const wheelSpacingOptions = ["112.00", "114.30", "115.00"];
  const wheelTreadDepthOptions = ["18", "19", "20"];
  const wheelWidthOptions = ["245", "255", "265"];

  return (
    <CardContent className="space-y-4">
      {/* Basic Filters Section */}
      <div>
        <button
          type="button"
          onClick={() => setShowBasicFilters(!showBasicFilters)}
          className="flex items-center justify-between w-full mb-4 text-lg font-semibold hover:opacity-80 transition-opacity"
        >
          <span>Basic Filters</span>
          {showBasicFilters ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>

        {showBasicFilters && (
          <>
            {/* Multi-select filters in a grid */}
            <div
              className="grid gap-4 mb-4"
              style={{
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              }}
            >
              {/* Brand */}
              <div>
                <label className="text-sm font-medium mb-2 block">Brand</label>
                <MultiSelectDropdown
                  options={uniqueBrands}
                  selected={filters.carBrand || []}
                  onChange={(selected) =>
                    onFiltersChange({ carBrand: selected })
                  }
                  placeholder="Select brands..."
                />
              </div>

              {/* Model */}
              <div>
                <label className="text-sm font-medium mb-2 block">Model</label>
                <MultiSelectDropdown
                  options={uniqueModels}
                  selected={filters.carModel || []}
                  onChange={(selected) =>
                    onFiltersChange({ carModel: selected })
                  }
                  placeholder="Select models..."
                />
              </div>

              {/* Body Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Body Type
                </label>
                <MultiSelectDropdown
                  options={uniqueBodyTypes as BodyType[]}
                  selected={filters.bodyType || []}
                  onChange={(selected) =>
                    onFiltersChange({ bodyType: selected })
                  }
                  placeholder="Select body types..."
                />
              </div>

              {/* Part Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Part Type
                </label>
                <MultiSelectDropdown
                  options={uniquePartTypes}
                  selected={filters.partType || []}
                  onChange={(selected) =>
                    onFiltersChange({ partType: selected })
                  }
                  placeholder="Select part types..."
                />
              </div>

              {/* Gearbox */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Gearbox
                </label>
                <MultiSelectDropdown
                  options={uniqueGearboxes}
                  selected={filters.gearbox || []}
                  onChange={(selected) =>
                    onFiltersChange({ gearbox: selected })
                  }
                  placeholder="Select gearbox..."
                />
              </div>

              {/* Fuel Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Fuel Type
                </label>
                <MultiSelectDropdown
                  options={uniqueFuelTypes}
                  selected={filters.fuelType || []}
                  onChange={(selected) =>
                    onFiltersChange({ fuelType: selected as FuelType[] })
                  }
                  placeholder="Select fuel type..."
                />
              </div>

              {/* Wheel Drive */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Wheel Drive
                </label>
                <MultiSelectDropdown
                  options={wheelDriveOptions}
                  selected={filters.wheelDrive || []}
                  onChange={(selected) =>
                    onFiltersChange({
                      wheelDrive: selected as ("AWD" | "RWD" | "FWD")[],
                    })
                  }
                  placeholder="Select wheel drive..."
                />
              </div>

              {/* Side */}
              <div>
                <label className="text-sm font-medium mb-2 block">Side</label>
                <MultiSelectDropdown
                  options={wheelSideOptions}
                  selected={filters.wheelSide || []}
                  onChange={(selected) =>
                    onFiltersChange({
                      wheelSide: selected as ("Left" | "Right")[],
                    })
                  }
                  placeholder="Select side..."
                />
              </div>
            </div>

            {/* Warehouse - Full Width */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 block">
                Warehouse
              </label>
              <MultiSelectDropdown
                options={uniqueWarehouses}
                selected={filters.warehouse || []}
                onChange={(selected) =>
                  onFiltersChange({ warehouse: selected })
                }
                placeholder="Select warehouses..."
              />
            </div>

            {/* Year Range and Price Range in a row */}
            <div
              className="grid gap-4 mb-4"
              style={{
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(max(250px, calc((100% - 1rem) / 2)), 1fr))",
              }}
            >
              {/* Year Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Year Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min Year"
                    value={filters.yearRange.min || ""}
                    onChange={(e) =>
                      onFiltersChange({
                        yearRange: {
                          ...filters.yearRange,
                          min: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max Year"
                    value={filters.yearRange.max || ""}
                    onChange={(e) =>
                      onFiltersChange({
                        yearRange: {
                          ...filters.yearRange,
                          max: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Price Range (EUR)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange.min || ""}
                    onChange={(e) =>
                      onFiltersChange({
                        priceRange: {
                          ...filters.priceRange,
                          min: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange.max || ""}
                    onChange={(e) =>
                      onFiltersChange({
                        priceRange: {
                          ...filters.priceRange,
                          max: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Status and Is Stale in a row */}
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(max(200px, calc((100% - 3 * 1rem) / 4)), 1fr))",
              }}
            >
              {/* Status */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <SingleSelectDropdown
                  options={[
                    { value: "All", label: "All" },
                    { value: "In Stock", label: "In Stock" },
                    { value: "Reserved", label: "Reserved" },
                    { value: "Sold", label: "Sold" },
                    { value: "Returned", label: "Returned" },
                  ]}
                  value={filters.status}
                  onChange={(value) =>
                    onFiltersChange({
                      status: value as PartStatus | "All",
                    })
                  }
                  placeholder="Select status..."
                />
              </div>

              {/* Stale */}
              <div>
                <label className="text-sm font-medium mb-2 block">Stale</label>
                <SingleSelectDropdown
                  options={[
                    { value: "All", label: "All" },
                    { value: "1", label: "1 month" },
                    { value: "2", label: "2 months" },
                    { value: "3", label: "3 months" },
                    { value: "6", label: "6 months" },
                    { value: "12", label: "12 months" },
                  ]}
                  value={filters.staleMonths?.toString() || "All"}
                  onChange={(value) =>
                    onFiltersChange({
                      staleMonths:
                        value === "All" ? undefined : parseInt(value),
                    })
                  }
                  placeholder="Select stale period..."
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Wheel-specific filters - only show when part type is wheel */}
      {hasWheelParts && (
        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setShowWheelFilters(!showWheelFilters)}
            className="flex items-center justify-between w-full mb-4 text-lg font-semibold hover:opacity-80 transition-opacity"
          >
            <span>Wheel Filters</span>
            {showWheelFilters ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>

          {showWheelFilters && (
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(max(200px, calc((100% - 3 * 1rem) / 4)), 1fr))",
              }}
            >
              {/* Central Diameter */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Central Diameter
                </label>
                <MultiSelectDropdown
                  options={wheelCentralDiameterOptions}
                  selected={(filters.wheelCentralDiameter || []).map(String)}
                  onChange={(selected) =>
                    onFiltersChange({
                      wheelCentralDiameter: selected.map(Number),
                    })
                  }
                  placeholder="Select diameter..."
                />
              </div>

              {/* Fixing Points */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Fixing Points
                </label>
                <MultiSelectDropdown
                  options={wheelFixingPointsOptions}
                  selected={(filters.wheelFixingPoints || []).map(String)}
                  onChange={(selected) =>
                    onFiltersChange({
                      wheelFixingPoints: selected.map(Number),
                    })
                  }
                  placeholder="Select fixing points..."
                />
              </div>

              {/* Height */}
              <div>
                <label className="text-sm font-medium mb-2 block">Height</label>
                <MultiSelectDropdown
                  options={wheelHeightOptions}
                  selected={(filters.wheelHeight || []).map(String)}
                  onChange={(selected) =>
                    onFiltersChange({
                      wheelHeight: selected.map(Number),
                    })
                  }
                  placeholder="Select height..."
                />
              </div>

              {/* Spacing */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Spacing
                </label>
                <MultiSelectDropdown
                  options={wheelSpacingOptions}
                  selected={(filters.wheelSpacing || []).map(String)}
                  onChange={(selected) =>
                    onFiltersChange({
                      wheelSpacing: selected.map(Number),
                    })
                  }
                  placeholder="Select spacing..."
                />
              </div>

              {/* Tread Depth */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tread Depth
                </label>
                <MultiSelectDropdown
                  options={wheelTreadDepthOptions}
                  selected={(filters.wheelTreadDepth || []).map(String)}
                  onChange={(selected) =>
                    onFiltersChange({
                      wheelTreadDepth: selected.map(Number),
                    })
                  }
                  placeholder="Select tread depth..."
                />
              </div>

              {/* Width */}
              <div>
                <label className="text-sm font-medium mb-2 block">Width</label>
                <MultiSelectDropdown
                  options={wheelWidthOptions}
                  selected={(filters.wheelWidth || []).map(String)}
                  onChange={(selected) =>
                    onFiltersChange({
                      wheelWidth: selected.map(Number),
                    })
                  }
                  placeholder="Select width..."
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reset Filters */}
      <Button variant="outline" className="w-full" onClick={onReset}>
        Clear All Filters
      </Button>
    </CardContent>
  );
};
