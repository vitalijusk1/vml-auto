import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterState, FilterOption, TopDetailsFilter } from "@/types";
import { Filter, RotateCcw } from "lucide-react";
import { SingleSelectDropdown } from "@/components/ui/SingleSelectDropdown";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { defaultFilters } from "@/store/slices/filtersSlice";
import { LayoutType } from "./type";
import { PartFilters } from "./components/PartFilters/PartFilters";
import { AnalyticsFilters as AnalyticsFiltersComponent } from "./components/AnalyticsFilters/AnalyticsFilters";
import { OrderManagementFilters } from "./components/OrderManagementFilters/OrderManagementFilters";
import { useAppSelector } from "@/store/hooks";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { selectBackendFilters } from "@/store/selectors";
import { CategorySection } from "./components/CategorySection/CategorySection";
import { WheelsSection } from "./components/WheelsSection/WheelsSection";
import { FilterSection } from "./components/FilterSection/FilterSection";
import { Category } from "@/utils/backendFilters";
import { getLocalizedText } from "@/utils/i18n";
import { MobileFilterPanel } from "./MobileFilterPanel";

interface FilterPanelProps<T extends FilterState> {
  type: LayoutType;
  filters: T;
  onFiltersChange: (filters: T) => void;
  onTopDetailsFilterChange?: (value: TopDetailsFilter) => void;
  onFilter?: () => void;
  isLoading?: boolean;
  hideCategoriesAndWheels?: boolean;
  hideTopDetailsFilter?: boolean;
}

const getFilter = (
  type: LayoutType,
  filters: FilterState,
  onFiltersChange: (updates: Partial<FilterState>) => void,
  onReset: () => void
) => {
  switch (type) {
    case LayoutType.PARTS:
      return (
        <PartFilters
          filters={filters as FilterState}
          onFiltersChange={
            onFiltersChange as (updates: Partial<FilterState>) => void
          }
          onReset={onReset}
        />
      );
    case LayoutType.ANALYTICS:
      return (
        <AnalyticsFiltersComponent
          filters={filters as FilterState}
          onFiltersChange={
            onFiltersChange as (updates: Partial<FilterState>) => void
          }
          onReset={onReset}
        />
      );
    case LayoutType.ORDER_CONTROL:
      return (
        <OrderManagementFilters
          filters={filters as FilterState}
          onFiltersChange={
            onFiltersChange as (updates: Partial<FilterState>) => void
          }
          onReset={onReset}
        />
      );
    default:
      return null;
  }
};

export function FilterPanel<T extends FilterState>({
  type,
  filters,
  onFiltersChange,
  onTopDetailsFilterChange,
  onFilter,
  isLoading = false,
  hideCategoriesAndWheels = false,
  hideTopDetailsFilter = false,
}: FilterPanelProps<T>) {
  const backendFilters = useAppSelector(selectBackendFilters);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Use ref to always get latest filters value to avoid stale closure issues
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      // Use ref to get latest filters value, avoiding stale closure
      onFiltersChange({ ...filtersRef.current, ...updates } as T);
    },
    [onFiltersChange]
  );

  const resetFilters = () => {
    // All filters are now page-specific (local state), no need to dispatch to Redux
    onFiltersChange(defaultFilters as T);
  };

  // Get title based on type
  const title = "Filtrai";
  const [isDefaultFiltersExpanded, setIsDefaultFiltersExpanded] =
    useState(false);
  const [topDetailsFilter, setTopDetailsFilter] = useState<TopDetailsFilter>(
    () => (filters as FilterState).sortBy || TopDetailsFilter.NONE
  );

  const handleTopDetailsFilterChange = (value: TopDetailsFilter) => {
    setTopDetailsFilter(value);
    if (onTopDetailsFilterChange) {
      onTopDetailsFilterChange(value);
    }
  };

  // Sync topDetailsFilter when filters change (e.g., from session storage load)
  useEffect(() => {
    const persistedSortBy = (filters as FilterState).sortBy;
    if (persistedSortBy) {
      setTopDetailsFilter(persistedSortBy);
    }
  }, [(filters as FilterState).sortBy]);

  // For parts filters, get categories and wheels data
  const { categories, wheelsFilters } = useBackendFilters();
  const partsFilters =
    type === LayoutType.PARTS ? (filters as FilterState) : null;

  // Helper to get category name from Category object
  const getCategoryName = (category: Category): string => {
    return getLocalizedText(category.languages, category.name);
  };

  // Create a lookup map for O(1) category access instead of searching tree each time
  const categoryMap = useMemo(() => {
    const map = new Map<number, Category>();
    const addToMap = (cats: Category[]) => {
      cats.forEach((cat) => {
        map.set(cat.id, cat);
        if (cat.subcategories && cat.subcategories.length > 0) {
          addToMap(cat.subcategories);
        }
      });
    };
    addToMap(categories);
    return map;
  }, [categories]);

  // Convert FilterOption[] to IDs for CategorySection
  const selectedCategoryIds = useMemo(() => {
    if (!partsFilters?.partCategory || partsFilters.partCategory.length === 0) {
      return [];
    }
    return partsFilters.partCategory.map((cat) => cat.id);
  }, [partsFilters?.partCategory]);

  // Helper function to get all child category FilterOptions recursively
  const getAllChildCategoryOptions = (category: Category): FilterOption[] => {
    const options: FilterOption[] = [];
    const addCategoryAndChildren = (cat: Category) => {
      options.push({ id: cat.id, name: getCategoryName(cat) });
      if (cat.subcategories && cat.subcategories.length > 0) {
        cat.subcategories.forEach((subcat) => {
          addCategoryAndChildren(subcat);
        });
      }
    };
    if (category.subcategories && category.subcategories.length > 0) {
      category.subcategories.forEach((subcat) => {
        addCategoryAndChildren(subcat);
      });
    }
    return options;
  };

  // Handle category toggle
  const handleCategoryToggle = (categoryId: number) => {
    if (!partsFilters) return;
    const category = categoryMap.get(categoryId);
    if (!category) return;

    const currentCategories = partsFilters.partCategory || [];
    // Get category name from current selection if available, otherwise from category object
    const existingCategory = currentCategories.find(
      (cat) => cat.id === categoryId
    );
    const categoryOption: FilterOption = existingCategory || {
      id: category.id,
      name: getCategoryName(category),
    };
    const isSelected = currentCategories.some((cat) => cat.id === categoryId);

    if (isSelected) {
      // Unselect parent and all children
      const childOptions = getAllChildCategoryOptions(category);
      const idsToRemove = new Set([
        categoryId,
        ...childOptions.map((opt) => opt.id),
      ]);
      updateFilters({
        partCategory: currentCategories.filter(
          (cat) => !idsToRemove.has(cat.id)
        ),
      } as Partial<FilterState>);
    } else {
      // Select parent and all children
      const childOptions = getAllChildCategoryOptions(category);
      const optionsToAdd = [categoryOption, ...childOptions];
      // Add only options that aren't already selected
      const existingIds = new Set(currentCategories.map((cat) => cat.id));
      const newCategories = [
        ...currentCategories,
        ...optionsToAdd.filter((opt) => !existingIds.has(opt.id)),
      ];
      updateFilters({
        partCategory: newCategories,
      } as Partial<FilterState>);
    }
  };

  // Convert FilterState wheel properties to WheelsSection format
  const selectedWheelFilters = useMemo((): Record<string, FilterOption[]> => {
    if (!partsFilters) {
      return {
        wheels: [],
        wheel_drives: [],
        wheels_fixing_points: [],
        wheels_spacing: [],
        wheels_central_diameter: [],
        wheels_width: [],
        wheels_height: [],
        wheels_tread_depth: [],
      };
    }
    return {
      wheels: partsFilters.wheelSide || [],
      wheel_drives: partsFilters.wheelDrive || [],
      wheels_fixing_points: partsFilters.wheelFixingPoints || [],
      wheels_spacing: partsFilters.wheelSpacing || [],
      wheels_central_diameter: partsFilters.wheelCentralDiameter || [],
      wheels_width: partsFilters.wheelWidth || [],
      wheels_height: partsFilters.wheelHeight || [],
      wheels_tread_depth: partsFilters.wheelTreadDepth || [],
    };
  }, [partsFilters]);

  // Handle wheel filter changes
  const handleWheelFilterChange = (
    filterKey: string,
    selected: FilterOption[]
  ) => {
    if (!partsFilters) return;
    const updates: Partial<FilterState> = {};

    switch (filterKey) {
      case "wheels":
        updates.wheelSide = selected;
        break;
      case "wheel_drives":
        updates.wheelDrive = selected;
        break;
      case "wheels_fixing_points":
        updates.wheelFixingPoints = selected;
        break;
      case "wheels_spacing":
        updates.wheelSpacing = selected;
        break;
      case "wheels_central_diameter":
        updates.wheelCentralDiameter = selected;
        break;
      case "wheels_width":
        updates.wheelWidth = selected;
        break;
      case "wheels_height":
        updates.wheelHeight = selected;
        break;
      case "wheels_tread_depth":
        updates.wheelTreadDepth = selected;
        break;
    }

    updateFilters(updates);
  };

  const hasCategories = categories.length > 0;
  const hasWheels = wheelsFilters && Object.keys(wheelsFilters).length > 0;

  // Calculate selected default filters count (for parts only)
  const defaultFiltersCount = useMemo(() => {
    if (type !== LayoutType.PARTS || !partsFilters) return 0;

    let count = 0;

    // Count array filters
    if (partsFilters.carBrand && partsFilters.carBrand.length > 0)
      count += partsFilters.carBrand.length;
    if (partsFilters.carModel && partsFilters.carModel.length > 0)
      count += partsFilters.carModel.length;
    if (partsFilters.bodyType && partsFilters.bodyType.length > 0)
      count += partsFilters.bodyType.length;
    if (partsFilters.quality && partsFilters.quality.length > 0)
      count += partsFilters.quality.length;
    if (partsFilters.position && partsFilters.position.length > 0)
      count += partsFilters.position.length;

    // Count status (if not "All")
    if (
      partsFilters.status !== "All" &&
      Array.isArray(partsFilters.status) &&
      partsFilters.status.length > 0
    ) {
      count += partsFilters.status.length;
    }

    // Count year range (if either min or max is set, count as 1)
    if (
      partsFilters.yearRange &&
      (partsFilters.yearRange.min !== undefined ||
        partsFilters.yearRange.max !== undefined)
    ) {
      count += 1;
    }

    // Count price range (if either min or max is set, count as 1)
    if (
      partsFilters.priceRange &&
      (partsFilters.priceRange.min !== undefined ||
        partsFilters.priceRange.max !== undefined)
    ) {
      count += 1;
    }

    return count;
  }, [type, partsFilters]);

  const hasDefaultFiltersSelection = defaultFiltersCount > 0;

  // Use mobile filter panel on mobile devices
  if (isMobile) {
    return (
      <MobileFilterPanel
        type={type}
        filters={filters}
        onFiltersChange={onFiltersChange}
        onTopDetailsFilterChange={onTopDetailsFilterChange}
        onFilter={onFilter}
        isLoading={isLoading}
        hideCategoriesAndWheels={hideCategoriesAndWheels}
        hideTopDetailsFilter={hideTopDetailsFilter}
      />
    );
  }

  // Desktop filter panel
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
            {type !== LayoutType.ORDER_CONTROL && !hideTopDetailsFilter && (
              <div className="w-full xs:w-auto">
                <SingleSelectDropdown
                  options={[
                    {
                      value: TopDetailsFilter.TOP_SELLING,
                      label: "Top parduodamas prekes",
                    },
                    {
                      value: TopDetailsFilter.LEAST_SELLING,
                      label: "Nepopuliarios",
                    },
                    { value: TopDetailsFilter.NONE, label: "Be filtro" },
                  ]}
                  value={topDetailsFilter}
                  onChange={handleTopDetailsFilterChange}
                  className="w-full xs:w-[200px]"
                />
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={resetFilters}
              className="h-8"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Išvalyti
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Categories Section - only for parts */}
        {type === LayoutType.PARTS &&
          hasCategories &&
          !hideCategoriesAndWheels && (
            <CategorySection
              categories={categories}
              selectedCategories={selectedCategoryIds}
              onCategoryToggle={handleCategoryToggle}
            />
          )}

        {/* Wheels Section - only for parts */}
        {type === LayoutType.PARTS &&
          hasWheels &&
          wheelsFilters &&
          !hideCategoriesAndWheels && (
            <WheelsSection
              wheels={wheelsFilters}
              selectedFilters={selectedWheelFilters}
              onFilterChange={handleWheelFilterChange}
            />
          )}

        {/* Default Filters Collapsible Section */}
        <FilterSection
          title="Pagrindiniai filtrai"
          isExpanded={isDefaultFiltersExpanded}
          onToggle={() =>
            setIsDefaultFiltersExpanded(!isDefaultFiltersExpanded)
          }
          hasSelection={hasDefaultFiltersSelection}
          selectionCount={defaultFiltersCount}
        >
          {getFilter(type, filters, updateFilters, resetFilters)}
        </FilterSection>

        {/* Filter Button */}
        {type === LayoutType.PARTS && onFilter && (
          <div className="flex justify-end pt-2">
            <Button
              className="px-6"
              onClick={onFilter}
              disabled={isLoading || !backendFilters}
            >
              {isLoading ? "Kraunama..." : "Filtruoti"}
            </Button>
          </div>
        )}
        {type === LayoutType.ANALYTICS && onFilter && (
          <div className="flex justify-end pt-2">
            <Button className="px-6" onClick={onFilter} disabled={isLoading}>
              {isLoading ? "Kraunama..." : "Filtruoti"}
            </Button>
          </div>
        )}
        {type === LayoutType.ORDER_CONTROL && onFilter && (
          <div className="flex justify-end pt-2">
            <Button
              className="px-6"
              onClick={onFilter}
              disabled={
                isLoading ||
                !(filters as FilterState).carBrand ||
                (filters as FilterState).carBrand?.length === 0 ||
                !(filters as FilterState).carModel ||
                (filters as FilterState).carModel?.length === 0
              }
            >
              {isLoading ? "Kraunama..." : "Filtruoti"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
