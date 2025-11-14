import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MultiSelectDropdown } from "@/components/ui/MultiSelectDropdown";
import { DynamicInputRow } from "@/components/ui/DynamicInputRow";
import { cn } from "@/lib/utils";
import {
  FilterState,
  PartStatus,
  PartQuality,
  PartPosition,
  BodyType,
  Car,
} from "@/types";
import { CategorySection } from "../CategorySection/CategorySection";
import { WheelsSection } from "../WheelsSection/WheelsSection";
import { Category } from "@/utils/filterCars";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";

interface PartFiltersProps {
  filters: FilterState;
  onFiltersChange: (updates: Partial<FilterState>) => void;
  onReset: () => void;
  cars?: Car[];
}

// Helper function to recursively find a category by ID
function findCategoryById(
  categories: Category[],
  categoryId: number
): Category | null {
  for (const category of categories) {
    if (category.id === categoryId) {
      return category;
    }
    if (category.subcategories && category.subcategories.length > 0) {
      const found = findCategoryById(category.subcategories, categoryId);
      if (found) return found;
    }
  }
  return null;
}

// Helper function to get category name (prefer English, fallback to name)
function getCategoryName(category: Category): string {
  return category.languages?.en || category.languages?.name || category.name;
}

// Helper function to get all category names from selected IDs
function getCategoryNamesFromIds(
  categories: Category[],
  selectedIds: number[]
): string[] {
  return selectedIds
    .map((id) => findCategoryById(categories, id))
    .filter((cat): cat is Category => cat !== null)
    .map(getCategoryName);
}

export const PartFilters = ({
  filters,
  onFiltersChange,
  onReset,
  cars: _cars = [],
}: PartFiltersProps) => {
  const backendFilters = useAppSelector(selectBackendFilters);

  // Extract all filter options from backend using shared hook
  const {
    brands,
    models: allModels,
    bodyTypes,
    statuses,
    qualities,
    positions,
    categories,
    wheelsFilters,
  } = useBackendFilters();

  // Filter models based on selected brands
  // Models are nested under brands in the backend structure
  const models = useMemo(() => {
    const backendFiltersData = backendFilters as any;
    if (
      !backendFiltersData?.car?.brands ||
      !Array.isArray(backendFiltersData.car.brands)
    ) {
      return allModels;
    }

    // If no brands selected, return all models from all brands
    if (!filters.carBrand || filters.carBrand.length === 0) {
      const allModelsFromBrands: string[] = [];
      for (const brand of backendFiltersData.car.brands) {
        if (brand.models && Array.isArray(brand.models)) {
          const brandModels = brand.models.map((model: any) => {
            // Models have name directly, no languages property
            return model.name || String(model);
          });
          allModelsFromBrands.push(...brandModels);
        }
      }
      return [...new Set(allModelsFromBrands)]; // Remove duplicates
    }

    // Get selected brand names and find matching brands
    const selectedBrandNames = filters.carBrand;
    const modelsByBrand: string[] = [];

    for (const brand of backendFiltersData.car.brands) {
      // Extract brand name
      const brandName =
        typeof brand === "string"
          ? brand
          : brand.languages?.en || brand.languages?.name || brand.name;

      // Check if this brand is selected
      if (selectedBrandNames.includes(brandName)) {
        // Extract models from this brand
        if (brand.models && Array.isArray(brand.models)) {
          const brandModels = brand.models.map((model: any) => {
            // Models have name directly
            return model.name || String(model);
          });
          modelsByBrand.push(...brandModels);
        }
      }
    }

    // Return unique models from selected brands
    return [...new Set(modelsByBrand)];
  }, [allModels, filters.carBrand, backendFilters]);

  // Track selected wheel filters - sync with filter state
  const selectedWheelFilters = useMemo(() => {
    const wheelFilters: Record<string, string[]> = {};
    if (filters.wheelSide && filters.wheelSide.length > 0)
      wheelFilters.wheels = Array.from(new Set(filters.wheelSide));
    if (filters.wheelDrive && filters.wheelDrive.length > 0)
      wheelFilters.wheel_drives = Array.from(new Set(filters.wheelDrive));
    if (filters.wheelFixingPoints && filters.wheelFixingPoints.length > 0)
      wheelFilters.wheels_fixing_points = Array.from(
        new Set(filters.wheelFixingPoints.map(String))
      );
    if (filters.wheelSpacing && filters.wheelSpacing.length > 0)
      wheelFilters.wheels_spacing = Array.from(
        new Set(filters.wheelSpacing.map(String))
      );
    if (
      filters.wheelCentralDiameter &&
      filters.wheelCentralDiameter.length > 0
    ) {
      // Convert numbers to strings, ensuring they match the format from backend
      const centralDiameterStrings = filters.wheelCentralDiameter.map((val) => {
        // Normalize number to string (remove decimals if whole number)
        const num = Number(val);
        if (!isNaN(num) && isFinite(num)) {
          return num % 1 === 0 ? String(num) : String(num);
        }
        return String(val);
      });
      wheelFilters.wheels_central_diameter = Array.from(
        new Set(centralDiameterStrings)
      );
    }
    if (filters.wheelWidth && filters.wheelWidth.length > 0)
      wheelFilters.wheels_width = Array.from(
        new Set(filters.wheelWidth.map(String))
      );
    if (filters.wheelHeight && filters.wheelHeight.length > 0)
      wheelFilters.wheels_height = Array.from(
        new Set(filters.wheelHeight.map(String))
      );
    if (filters.wheelTreadDepth && filters.wheelTreadDepth.length > 0)
      wheelFilters.wheels_tread_depth = Array.from(
        new Set(filters.wheelTreadDepth.map(String))
      );
    return wheelFilters;
  }, [filters]);

  // Handle wheel filter changes
  const handleWheelFilterChange = (filterKey: string, selected: string[]) => {
    // Map wheel filter keys to FilterState properties
    const filterStateKey =
      filterKey === "wheels"
        ? "wheelSide"
        : filterKey === "wheel_drives"
        ? "wheelDrive"
        : filterKey === "wheels_fixing_points"
        ? "wheelFixingPoints"
        : filterKey === "wheels_spacing"
        ? "wheelSpacing"
        : filterKey === "wheels_central_diameter"
        ? "wheelCentralDiameter"
        : filterKey === "wheels_width"
        ? "wheelWidth"
        : filterKey === "wheels_height"
        ? "wheelHeight"
        : filterKey === "wheels_tread_depth"
        ? "wheelTreadDepth"
        : undefined;

    if (filterStateKey) {
      // Convert string arrays to number arrays for numeric filters
      // Remove duplicates by converting to Set and back to array
      if (
        filterKey === "wheels_fixing_points" ||
        filterKey === "wheels_spacing" ||
        filterKey === "wheels_central_diameter" ||
        filterKey === "wheels_width" ||
        filterKey === "wheels_height" ||
        filterKey === "wheels_tread_depth"
      ) {
        // Remove duplicates and convert to numbers
        // Parse as numbers, filter out NaN, then remove duplicates
        const numbers = selected
          .map((s) => {
            const num = Number(s);
            return isNaN(num) ? null : num;
          })
          .filter((n): n is number => n !== null);
        const uniqueNumbers = Array.from(new Set(numbers));
        onFiltersChange({
          [filterStateKey]: uniqueNumbers,
        } as Partial<FilterState>);
      } else {
        // Remove duplicates for string arrays
        const uniqueStrings = Array.from(new Set(selected));
        onFiltersChange({
          [filterStateKey]: uniqueStrings,
        } as Partial<FilterState>);
      }
    }
  };

  // Log available filters for debugging
  useMemo(() => {
    if (backendFilters) {
      // Debug logging removed
    }
  }, [
    backendFilters,
    brands,
    models,
    bodyTypes,
    qualities,
    positions,
    categories,
    wheelsFilters,
  ]);

  // Helper to find category IDs from names (for syncing with filter state)
  const findCategoryIdsByName = useMemo(() => {
    const nameToIdMap = new Map<string, number>();
    const traverse = (cats: Category[]) => {
      for (const cat of cats) {
        const name = getCategoryName(cat);
        nameToIdMap.set(name, cat.id);
        if (cat.subcategories && cat.subcategories.length > 0) {
          traverse(cat.subcategories);
        }
      }
    };
    traverse(categories);
    return (names: string[]): number[] => {
      return names
        .map((name) => nameToIdMap.get(name))
        .filter((id): id is number => id !== undefined);
    };
  }, [categories]);

  // Sync selectedCategories with filter state
  const selectedCategories = useMemo(() => {
    if (filters.partCategory && filters.partCategory.length > 0) {
      return findCategoryIdsByName(filters.partCategory);
    }
    return [];
  }, [filters.partCategory, findCategoryIdsByName]);

  // Handle category selection
  const handleCategoryToggle = (categoryId: number) => {
    const newSelectedIds = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];

    // Convert selected IDs to category names and update filter
    const categoryNames = getCategoryNamesFromIds(categories, newSelectedIds);
    onFiltersChange({ partCategory: categoryNames });
  };

  // Collapsible section states
  const [isBasicFiltersExpanded, setIsBasicFiltersExpanded] = useState(false);

  // Check if any basic filter is active (not at default)
  const hasActiveBasicFilters = useMemo(() => {
    return (
      (filters.search && filters.search.trim() !== "") ||
      (filters.status !== "All" &&
        Array.isArray(filters.status) &&
        filters.status.length > 0) ||
      (filters.carBrand && filters.carBrand.length > 0) ||
      (filters.carModel && filters.carModel.length > 0) ||
      (filters.carYear && filters.carYear.length > 0) ||
      filters.yearRange?.min !== undefined ||
      filters.yearRange?.max !== undefined ||
      (filters.bodyType && filters.bodyType.length > 0) ||
      (filters.partType && filters.partType.length > 0) ||
      (filters.quality && filters.quality.length > 0) ||
      (filters.position && filters.position.length > 0) ||
      filters.priceRange?.min !== undefined ||
      filters.priceRange?.max !== undefined ||
      filters.staleMonths !== undefined ||
      (filters.warehouse && filters.warehouse.length > 0)
    );
  }, [filters]);

  // Count active basic filters
  const activeBasicFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search && filters.search.trim() !== "") count++;
    if (
      filters.status !== "All" &&
      Array.isArray(filters.status) &&
      filters.status.length > 0
    )
      count++;
    if (filters.carBrand && filters.carBrand.length > 0) count++;
    if (filters.carModel && filters.carModel.length > 0) count++;
    if (filters.carYear && filters.carYear.length > 0) count++;
    if (
      filters.yearRange?.min !== undefined ||
      filters.yearRange?.max !== undefined
    )
      count++;
    if (filters.bodyType && filters.bodyType.length > 0) count++;
    if (filters.partType && filters.partType.length > 0) count++;
    if (filters.quality && filters.quality.length > 0) count++;
    if (filters.position && filters.position.length > 0) count++;
    if (
      filters.priceRange?.min !== undefined ||
      filters.priceRange?.max !== undefined
    )
      count++;
    if (filters.staleMonths !== undefined) count++;
    if (filters.warehouse && filters.warehouse.length > 0) count++;
    return count;
  }, [filters]);

  return (
    <CardContent className="space-y-6">
      {/* Categories Section */}
      {backendFilters === null ? (
        <p className="text-muted-foreground text-sm">Loading filters...</p>
      ) : (
        <>
          <CategorySection
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
          />

          {/* Wheels Section */}
          {wheelsFilters && Object.keys(wheelsFilters).length > 0 && (
            <WheelsSection
              wheels={wheelsFilters}
              selectedFilters={selectedWheelFilters}
              onFilterChange={handleWheelFilterChange}
            />
          )}
        </>
      )}

      {/* Basic Filters Section */}
      <div className="space-y-3">
        <div>
          <button
            onClick={() => setIsBasicFiltersExpanded(!isBasicFiltersExpanded)}
            className={cn(
              "flex w-full items-center justify-between rounded-md px-2 py-1.5 transition-colors",
              hasActiveBasicFilters
                ? "bg-primary/10 hover:bg-primary/20 border border-primary/30"
                : "hover:bg-accent/50"
            )}
          >
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Basic Filters
              </h3>
              {hasActiveBasicFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  {activeBasicFiltersCount}
                </span>
              )}
            </div>
            {isBasicFiltersExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
          {/* Border line with 24px gap */}
          <div className="mt-6 border-t border-border" />
        </div>

        {isBasicFiltersExpanded && (
          <div className="pl-2 space-y-4">
            <DynamicInputRow gap={4}>
              {/* Brand */}
              <div>
                <label className="text-sm font-medium mb-2 block">Brand</label>
                <MultiSelectDropdown
                  options={brands}
                  selected={filters.carBrand || []}
                  onChange={(selected) => {
                    onFiltersChange({
                      carBrand: selected,
                      // Clear models when brands change since models depend on brands
                      carModel: [],
                    });
                  }}
                  placeholder="Select brands"
                  searchable={true}
                  searchPlaceholder="Search brands..."
                />
              </div>

              {/* Model */}
              <div>
                <label className="text-sm font-medium mb-2 block">Model</label>
                <MultiSelectDropdown
                  options={models}
                  selected={filters.carModel || []}
                  onChange={(selected) =>
                    onFiltersChange({ carModel: selected })
                  }
                  placeholder="Select models"
                  searchable={true}
                  searchPlaceholder="Search models..."
                />
              </div>

              {/* Body Type */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Body Type
                </label>
                <MultiSelectDropdown
                  options={bodyTypes as BodyType[]}
                  selected={filters.bodyType || []}
                  onChange={(selected) =>
                    onFiltersChange({ bodyType: selected })
                  }
                  placeholder="Select body types"
                  searchable={true}
                  searchPlaceholder="Search body types..."
                />
              </div>

              {/* Quality */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Quality
                </label>
                <MultiSelectDropdown
                  options={qualities}
                  selected={filters.quality || []}
                  onChange={(selected) =>
                    onFiltersChange({ quality: selected as PartQuality[] })
                  }
                  placeholder="Select qualities"
                  searchable={true}
                  searchPlaceholder="Search qualities..."
                />
              </div>

              {/* Position */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Position
                </label>
                <MultiSelectDropdown
                  options={positions}
                  selected={filters.position || []}
                  onChange={(selected) =>
                    onFiltersChange({ position: selected as PartPosition[] })
                  }
                  placeholder="Select positions"
                  searchable={true}
                  searchPlaceholder="Search positions..."
                />
              </div>
            </DynamicInputRow>

            {/* Year Range and Price Range */}
            <DynamicInputRow gap={4} maxPerRow={2}>
              {/* Year Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Year Range
                </label>
                <DynamicInputRow gap={2} maxPerRow={2}>
                  <Input
                    type="number"
                    placeholder="Min Year"
                    value={filters.yearRange?.min || ""}
                    onChange={(e) =>
                      onFiltersChange({
                        yearRange: {
                          ...(filters.yearRange || {}),
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
                    value={filters.yearRange?.max || ""}
                    onChange={(e) =>
                      onFiltersChange({
                        yearRange: {
                          ...(filters.yearRange || {}),
                          max: e.target.value
                            ? parseInt(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </DynamicInputRow>
              </div>

              {/* Price Range */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Price Range (EUR)
                </label>
                <DynamicInputRow gap={2} maxPerRow={2}>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange?.min || ""}
                    onChange={(e) =>
                      onFiltersChange({
                        priceRange: {
                          ...(filters.priceRange || {}),
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
                    value={filters.priceRange?.max || ""}
                    onChange={(e) =>
                      onFiltersChange({
                        priceRange: {
                          ...(filters.priceRange || {}),
                          max: e.target.value
                            ? parseFloat(e.target.value)
                            : undefined,
                        },
                      })
                    }
                  />
                </DynamicInputRow>
              </div>
            </DynamicInputRow>

            {/* Status and Stale */}
            <DynamicInputRow gap={4} maxPerRow={2}>
              {/* Status */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <MultiSelectDropdown
                  options={statuses}
                  selected={
                    filters.status === "All" ? [] : (filters.status as string[])
                  }
                  onChange={(selected) =>
                    onFiltersChange({
                      status:
                        selected.length === 0
                          ? "All"
                          : (selected as PartStatus[]),
                    })
                  }
                  placeholder="Select statuses"
                  searchable={true}
                  searchPlaceholder="Search statuses..."
                />
              </div>

              {/* Stale */}
              <div>
                <label className="text-sm font-medium mb-2 block">Stale</label>
                <MultiSelectDropdown
                  options={[
                    "1 month",
                    "2 months",
                    "3 months",
                    "6 months",
                    "12 months",
                  ]}
                  selected={
                    filters.staleMonths
                      ? [
                          `${filters.staleMonths} ${
                            filters.staleMonths === 1 ? "month" : "months"
                          }`,
                        ]
                      : []
                  }
                  onChange={(selected) => {
                    // For single-select behavior: if selecting a new option while one is already selected,
                    // automatically deselect the old one and select the new one
                    if (selected.length > 1) {
                      // If multiple items are selected, keep only the last one (newest selection)
                      const newestSelection = selected[selected.length - 1];
                      onFiltersChange({
                        staleMonths: parseInt(newestSelection.split(" ")[0]),
                      });
                    } else if (selected.length === 1) {
                      // Single selection
                      onFiltersChange({
                        staleMonths: parseInt(selected[0].split(" ")[0]),
                      });
                    } else {
                      // No selection
                      onFiltersChange({
                        staleMonths: undefined,
                      });
                    }
                  }}
                  placeholder="Select stale months"
                  searchable={true}
                  searchPlaceholder="Search stale months..."
                />
              </div>
            </DynamicInputRow>
          </div>
        )}
      </div>

      {/* Reset Filters */}
      <Button variant="outline" className="w-full" onClick={onReset}>
        Clear All Filters
      </Button>
    </CardContent>
  );
};
