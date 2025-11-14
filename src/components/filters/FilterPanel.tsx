import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterState, Car } from "@/types";
import { CarFilters } from "@/utils/filterCars";
import { AnalyticsFilters } from "@/views/analytics/AnalyticsFilters";
import { Filter, RotateCcw } from "lucide-react";
import { SingleSelectDropdown } from "@/components/ui/SingleSelectDropdown";
import { useState, useMemo } from "react";
import { defaultFilters } from "@/utils/filterParts";
import { LayoutType } from "./type";
import { CarFilters as CarFiltersComponent } from "./components/CarFilters/CarFilters";
import { PartFilters } from "./components/PartFilters/PartFilters";
import { AnalyticsFilters as AnalyticsFiltersComponent } from "./components/AnalyticsFilters/AnalyticsFilters";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { resetFilters as resetFiltersAction } from "@/store/slices/filtersSlice";
import { selectBackendFilters } from "@/store/selectors";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { CategorySection } from "./components/CategorySection/CategorySection";
import { WheelsSection } from "./components/WheelsSection/WheelsSection";
import { FilterSection } from "./components/FilterSection/FilterSection";
import { Category } from "@/utils/filterCars";

const defaultAnalyticsFilters: AnalyticsFilters = {
  dateRange: {},
  timePeriod: "month",
  orderStatus: ["Delivered"],
  partStatus: ["Sold"],
  category: [],
  brand: [],
  metric: "revenue",
};

interface FilterPanelProps<
  T extends FilterState | CarFilters | AnalyticsFilters
> {
  type: LayoutType;
  filters: T;
  onFiltersChange: (filters: T) => void;
  cars?: Car[];
}

const getFilter = (
  type: LayoutType,
  filters: FilterState | CarFilters | AnalyticsFilters,
  onFiltersChange: (
    updates: Partial<FilterState | CarFilters | AnalyticsFilters>
  ) => void,
  onReset: () => void,
  cars: Car[] = []
) => {
  switch (type) {
    case LayoutType.CAR:
      return (
        <CarFiltersComponent
          filters={filters as CarFilters}
          onFiltersChange={
            onFiltersChange as (updates: Partial<CarFilters>) => void
          }
          onReset={onReset}
          cars={cars}
        />
      );
    case LayoutType.PARTS:
      return (
        <PartFilters
          filters={filters as FilterState}
          onFiltersChange={
            onFiltersChange as (updates: Partial<FilterState>) => void
          }
          onReset={onReset}
          cars={cars}
        />
      );
    case LayoutType.ANALYTICS:
      return (
        <AnalyticsFiltersComponent
          filters={filters as AnalyticsFilters}
          onFiltersChange={
            onFiltersChange as (updates: Partial<AnalyticsFilters>) => void
          }
          onReset={onReset}
          cars={cars}
        />
      );
    default:
      return null;
  }
};

export function FilterPanel<
  T extends FilterState | CarFilters | AnalyticsFilters
>({ type, filters, onFiltersChange, cars = [] }: FilterPanelProps<T>) {
  const dispatch = useAppDispatch();
  const [isOpen, setIsOpen] = useState(true);

  const updateFilters = (
    updates: Partial<FilterState | CarFilters | AnalyticsFilters>
  ) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const resetFilters = () => {
    if (type === LayoutType.CAR) {
      // Reset to empty filters object (will be fetched from backend)
      onFiltersChange({} as unknown as T);
    } else if (type === LayoutType.ANALYTICS) {
      onFiltersChange(defaultAnalyticsFilters as T);
    } else {
      // For parts filters, dispatch reset action to Redux
      dispatch(resetFiltersAction());
      onFiltersChange(defaultFilters as T);
    }
  };

  // Get title based on type
  const title = type === "analytics" ? "Analitikos filtrai" : "Filtrai";
  const [isDefaultFiltersExpanded, setIsDefaultFiltersExpanded] =
    useState(true);
  const [topDetailsFilter, setTopDetailsFilter] = useState<string>("be-filtro");

  // For parts filters, get categories and wheels data
  const backendFilters = useAppSelector(selectBackendFilters);
  const { categories, wheelsFilters } = useBackendFilters();
  const partsFilters =
    type === LayoutType.PARTS ? (filters as FilterState) : null;

  // Helper to get category name from Category object
  const getCategoryName = (category: Category): string => {
    return category.languages?.en || category.languages?.name || category.name;
  };

  // Helper to recursively find category by ID
  const findCategoryById = (
    categories: Category[],
    id: number
  ): Category | undefined => {
    for (const category of categories) {
      if (category.id === id) return category;
      if (category.subcategories && category.subcategories.length > 0) {
        const found = findCategoryById(category.subcategories, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  // Convert category names to IDs for CategorySection
  const selectedCategoryIds = useMemo(() => {
    if (!partsFilters?.partCategory || partsFilters.partCategory.length === 0) {
      return [];
    }
    const ids: number[] = [];
    const findIdsByName = (cats: Category[], names: string[]) => {
      for (const cat of cats) {
        const name = getCategoryName(cat);
        if (names.includes(name)) {
          ids.push(cat.id);
        }
        if (cat.subcategories && cat.subcategories.length > 0) {
          findIdsByName(cat.subcategories, names);
        }
      }
    };
    findIdsByName(categories, partsFilters.partCategory);
    return ids;
  }, [partsFilters?.partCategory, categories]);

  // Helper function to get all child category names recursively
  const getAllChildCategoryNames = (category: Category): string[] => {
    const names: string[] = [];
    const addCategoryAndChildren = (cat: Category) => {
      names.push(getCategoryName(cat));
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
    return names;
  };

  // Handle category toggle
  const handleCategoryToggle = (categoryId: number) => {
    if (!partsFilters) return;
    const category = findCategoryById(categories, categoryId);
    if (!category) return;

    const categoryName = getCategoryName(category);
    const currentCategories = partsFilters.partCategory || [];
    const isSelected = currentCategories.includes(categoryName);

    if (isSelected) {
      // Unselect parent and all children
      const childNames = getAllChildCategoryNames(category);
      const namesToRemove = [categoryName, ...childNames];
      updateFilters({
        partCategory: currentCategories.filter(
          (name) => !namesToRemove.includes(name)
        ),
      } as Partial<FilterState>);
    } else {
      // Select parent and all children
      const childNames = getAllChildCategoryNames(category);
      const namesToAdd = [categoryName, ...childNames];
      // Add only names that aren't already selected
      const newCategories = [...currentCategories];
      namesToAdd.forEach((name) => {
        if (!newCategories.includes(name)) {
          newCategories.push(name);
        }
      });
      updateFilters({
        partCategory: newCategories,
      } as Partial<FilterState>);
    }
  };

  // Convert FilterState wheel properties to WheelsSection format
  const selectedWheelFilters = useMemo((): Record<string, string[]> => {
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
      wheels_fixing_points: partsFilters.wheelFixingPoints?.map(String) || [],
      wheels_spacing: partsFilters.wheelSpacing?.map(String) || [],
      wheels_central_diameter:
        partsFilters.wheelCentralDiameter?.map(String) || [],
      wheels_width: partsFilters.wheelWidth?.map(String) || [],
      wheels_height: partsFilters.wheelHeight?.map(String) || [],
      wheels_tread_depth: partsFilters.wheelTreadDepth?.map(String) || [],
    };
  }, [partsFilters]);

  // Handle wheel filter changes
  const handleWheelFilterChange = (filterKey: string, selected: string[]) => {
    if (!partsFilters) return;
    const updates: Partial<FilterState> = {};

    switch (filterKey) {
      case "wheels":
        updates.wheelSide = selected as ("Left" | "Right")[];
        break;
      case "wheel_drives":
        updates.wheelDrive = selected as ("AWD" | "RWD" | "FWD")[];
        break;
      case "wheels_fixing_points":
        updates.wheelFixingPoints = selected.map(Number);
        break;
      case "wheels_spacing":
        updates.wheelSpacing = selected.map(Number);
        break;
      case "wheels_central_diameter":
        updates.wheelCentralDiameter = selected.map(Number);
        break;
      case "wheels_width":
        updates.wheelWidth = selected.map(Number);
        break;
      case "wheels_height":
        updates.wheelHeight = selected.map(Number);
        break;
      case "wheels_tread_depth":
        updates.wheelTreadDepth = selected.map(Number);
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
            <div className="w-full xs:w-auto">
              <SingleSelectDropdown
                options={[
                  { value: "top-detales", label: "Top detalės" },
                  {
                    value: "reciausiai-parduodamos",
                    label: "Nepopuliarios",
                  },
                  { value: "be-filtro", label: "Be filtro" },
                ]}
                value={topDetailsFilter}
                onChange={setTopDetailsFilter}
                className="w-full xs:w-[200px]"
              />
            </div>
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
        {type === LayoutType.PARTS && hasCategories && (
          <CategorySection
            categories={categories}
            selectedCategories={selectedCategoryIds}
            onCategoryToggle={handleCategoryToggle}
          />
        )}

        {/* Wheels Section - only for parts */}
        {type === LayoutType.PARTS && hasWheels && wheelsFilters && (
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
          {getFilter(type, filters, updateFilters, resetFilters, cars)}
        </FilterSection>

        {/* Filter Button */}
        {type === LayoutType.PARTS && (
          <div className="flex justify-end pt-2">
            <Button className="px-6">Filtruoti</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
