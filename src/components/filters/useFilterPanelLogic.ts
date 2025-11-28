import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { FilterState, FilterOption, TopDetailsFilter } from "@/types";
import { defaultFilters } from "@/store/slices/filtersSlice";
import { LayoutType } from "@/components/filters/type";
import { useAppSelector } from "@/store/hooks";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { selectBackendFilters } from "@/store/selectors";
import { Category } from "@/utils/backendFilters";
import { getLocalizedText } from "@/utils/i18n";

interface UseFilterPanelLogicProps<T extends FilterState> {
  type: LayoutType;
  filters: T;
  onFiltersChange: (filters: T) => void;
  onTopDetailsFilterChange?: (value: TopDetailsFilter) => void;
}

/**
 * Shared logic for FilterPanel and MobileFilterPanel components.
 * Extracts all common state, memoized values, and handlers.
 */
export function useFilterPanelLogic<T extends FilterState>({
  type,
  filters,
  onFiltersChange,
  onTopDetailsFilterChange,
}: UseFilterPanelLogicProps<T>) {
  const backendFilters = useAppSelector(selectBackendFilters);
  const { categories, wheelsFilters } = useBackendFilters();

  // Use ref to always get latest filters value to avoid stale closure issues
  const filtersRef = useRef(filters);
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  // Top details filter state
  const [topDetailsFilter, setTopDetailsFilter] = useState<TopDetailsFilter>(
    () => (filters as FilterState).sortBy || TopDetailsFilter.NONE
  );

  // Sync topDetailsFilter when filters change (e.g., from session storage load)
  useEffect(() => {
    const persistedSortBy = (filters as FilterState).sortBy;
    if (persistedSortBy) {
      setTopDetailsFilter(persistedSortBy);
    }
  }, [(filters as FilterState).sortBy]);

  // Update filters helper
  const updateFilters = useCallback(
    (updates: Partial<FilterState>) => {
      onFiltersChange({ ...filtersRef.current, ...updates } as T);
    },
    [onFiltersChange]
  );

  // Reset filters to defaults
  const resetFilters = useCallback(() => {
    onFiltersChange(defaultFilters as T);
  }, [onFiltersChange]);

  // Handle top details filter change
  const handleTopDetailsFilterChange = useCallback(
    (value: TopDetailsFilter) => {
      setTopDetailsFilter(value);
      onTopDetailsFilterChange?.(value);
    },
    [onTopDetailsFilterChange]
  );

  // Parts filters (only for PARTS type)
  const partsFilters =
    type === LayoutType.PARTS ? (filters as FilterState) : null;

  // Helper to get category name from Category object
  const getCategoryName = useCallback((category: Category): string => {
    return getLocalizedText(category.languages, category.name);
  }, []);

  // Create a lookup map for O(1) category access and parent lookup
  const { categoryMap, parentMap } = useMemo(() => {
    const catMap = new Map<number, Category>();
    const parMap = new Map<number, number>(); // child id -> parent id

    const addToMap = (cats: Category[], parentId?: number) => {
      cats.forEach((cat) => {
        catMap.set(cat.id, cat);
        if (parentId !== undefined) {
          parMap.set(cat.id, parentId);
        }
        if (cat.subcategories && cat.subcategories.length > 0) {
          addToMap(cat.subcategories, cat.id);
        }
      });
    };
    addToMap(categories);
    return { categoryMap: catMap, parentMap: parMap };
  }, [categories]);

  // Convert FilterOption[] to IDs for CategorySection
  const selectedCategoryIds = useMemo(() => {
    if (!partsFilters?.partCategory || partsFilters.partCategory.length === 0) {
      return [];
    }
    return partsFilters.partCategory.map((cat) => cat.id);
  }, [partsFilters?.partCategory]);

  // Helper function to get all child category FilterOptions recursively
  const getAllChildCategoryOptions = useCallback(
    (category: Category): FilterOption[] => {
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
    },
    [getCategoryName]
  );

  // Helper to get all ancestor IDs (parents, grandparents, etc.)
  const getAncestorIds = useCallback(
    (categoryId: number): number[] => {
      const ancestors: number[] = [];
      let currentId = categoryId;
      while (parentMap.has(currentId)) {
        const parentId = parentMap.get(currentId)!;
        ancestors.push(parentId);
        currentId = parentId;
      }
      return ancestors;
    },
    [parentMap]
  );

  // Handle category toggle
  const handleCategoryToggle = useCallback(
    (categoryId: number) => {
      if (!partsFilters) return;
      const category = categoryMap.get(categoryId);
      if (!category) return;

      const currentCategories = partsFilters.partCategory || [];
      const existingCategory = currentCategories.find(
        (cat) => cat.id === categoryId
      );
      const categoryOption: FilterOption = existingCategory || {
        id: category.id,
        name: getCategoryName(category),
      };
      const isSelected = currentCategories.some((cat) => cat.id === categoryId);

      if (isSelected) {
        // Unselect this category and all its children
        const childOptions = getAllChildCategoryOptions(category);
        const idsToRemove = new Set([
          categoryId,
          ...childOptions.map((opt) => opt.id),
        ]);

        // Also unselect all ancestors (parents) since not all children are selected anymore
        const ancestorIds = getAncestorIds(categoryId);
        ancestorIds.forEach((id) => idsToRemove.add(id));

        updateFilters({
          partCategory: currentCategories.filter(
            (cat) => !idsToRemove.has(cat.id)
          ),
        } as Partial<FilterState>);
      } else {
        // Select parent and all children
        const childOptions = getAllChildCategoryOptions(category);
        const optionsToAdd = [categoryOption, ...childOptions];
        const existingIds = new Set(currentCategories.map((cat) => cat.id));
        const newCategories = [
          ...currentCategories,
          ...optionsToAdd.filter((opt) => !existingIds.has(opt.id)),
        ];
        updateFilters({
          partCategory: newCategories,
        } as Partial<FilterState>);
      }
    },
    [
      partsFilters,
      categoryMap,
      getCategoryName,
      getAllChildCategoryOptions,
      getAncestorIds,
      updateFilters,
    ]
  );

  // Wheel filter key mapping
  const wheelFilterKeyMap: Record<string, keyof FilterState> = {
    wheels: "wheelSide",
    wheel_drives: "wheelDrive",
    wheels_fixing_points: "wheelFixingPoints",
    wheels_spacing: "wheelSpacing",
    wheels_central_diameter: "wheelCentralDiameter",
    wheels_width: "wheelWidth",
    wheels_height: "wheelHeight",
    wheels_tread_depth: "wheelTreadDepth",
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
  const handleWheelFilterChange = useCallback(
    (filterKey: string, selected: FilterOption[]) => {
      if (!partsFilters) return;
      const stateKey = wheelFilterKeyMap[filterKey];
      if (stateKey) {
        updateFilters({ [stateKey]: selected } as Partial<FilterState>);
      }
    },
    [partsFilters, updateFilters]
  );

  // Computed flags
  const hasCategories = categories.length > 0;
  const hasWheels = wheelsFilters && Object.keys(wheelsFilters).length > 0;

  // Helper to count selected filters
  const countFilters = useCallback(
    (includeCategories: boolean): number => {
      if (type !== LayoutType.PARTS || !partsFilters) return 0;

      let count = 0;

      // Count array filters
      count += partsFilters.carBrand?.length || 0;
      count += partsFilters.carModel?.length || 0;
      count += partsFilters.bodyType?.length || 0;
      count += partsFilters.quality?.length || 0;
      count += partsFilters.position?.length || 0;

      if (includeCategories) {
        count += partsFilters.partCategory?.length || 0;
      }

      // Count status (if not "All")
      if (partsFilters.status !== "All" && Array.isArray(partsFilters.status)) {
        count += partsFilters.status.length;
      }

      // Count year range (if either min or max is set, count as 1)
      if (
        partsFilters.yearRange?.min !== undefined ||
        partsFilters.yearRange?.max !== undefined
      ) {
        count += 1;
      }

      // Count price range (if either min or max is set, count as 1)
      if (
        partsFilters.priceRange?.min !== undefined ||
        partsFilters.priceRange?.max !== undefined
      ) {
        count += 1;
      }

      return count;
    },
    [type, partsFilters]
  );

  // Total filters count (includes categories)
  const filtersCount = useMemo(() => countFilters(true), [countFilters]);

  // Default filters count (excludes partCategory for collapsible section badge)
  const defaultFiltersCount = useMemo(
    () => countFilters(false),
    [countFilters]
  );

  return {
    // State
    backendFilters,
    topDetailsFilter,
    categories,
    wheelsFilters,

    // Computed values
    partsFilters,
    categoryMap,
    selectedCategoryIds,
    selectedWheelFilters,
    hasCategories,
    hasWheels,
    filtersCount,
    defaultFiltersCount,
    hasDefaultFiltersSelection: defaultFiltersCount > 0,

    // Handlers
    updateFilters,
    resetFilters,
    handleTopDetailsFilterChange,
    handleCategoryToggle,
    handleWheelFilterChange,
  };
}
