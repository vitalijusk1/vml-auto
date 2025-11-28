import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterState, TopDetailsFilter } from "@/types";
import { Filter, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";
import { SingleSelectDropdown } from "@/components/ui/SingleSelectDropdown";
import { useState } from "react";
import { LayoutType } from "./type";
import { CategorySection } from "./components/CategorySection/CategorySection";
import { WheelsSection } from "./components/WheelsSection/WheelsSection";
import { FilterSection } from "./components/FilterSection/FilterSection";
import { useFilterPanelLogic } from "@/components/filters/useFilterPanelLogic";
import { getFilterComponent } from "./getFilterComponent";

interface MobileFilterPanelProps<T extends FilterState> {
  type: LayoutType;
  filters: T;
  onFiltersChange: (filters: T) => void;
  onTopDetailsFilterChange?: (value: TopDetailsFilter) => void;
  onFilter?: () => void;
  isLoading?: boolean;
  hideCategoriesAndWheels?: boolean;
  hideTopDetailsFilter?: boolean;
}

export function MobileFilterPanel<T extends FilterState>({
  type,
  filters,
  onFiltersChange,
  onTopDetailsFilterChange,
  onFilter,
  isLoading = false,
  hideCategoriesAndWheels = false,
  hideTopDetailsFilter = false,
}: MobileFilterPanelProps<T>) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDefaultFiltersExpanded, setIsDefaultFiltersExpanded] =
    useState(false);

  // Use shared filter panel logic
  const {
    backendFilters,
    topDetailsFilter,
    categories,
    wheelsFilters,
    selectedCategoryIds,
    selectedWheelFilters,
    hasCategories,
    hasWheels,
    filtersCount,
    updateFilters,
    resetFilters,
    handleTopDetailsFilterChange,
    handleCategoryToggle,
    handleWheelFilterChange,
  } = useFilterPanelLogic({
    type,
    filters,
    onFiltersChange,
    onTopDetailsFilterChange,
  });

  return (
    <Card>
      <CardContent className="p-4">
        {/* Mobile Filter Header - Always Visible */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filtrai</span>
            {filtersCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                {filtersCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {filtersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 px-2"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-2"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Top Details Filter - Always visible for parts */}
        {type === LayoutType.PARTS && !hideTopDetailsFilter && (
          <div className="mb-3">
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
              className="w-full"
            />
          </div>
        )}

        {/* Expandable Filter Content */}
        {isExpanded && (
          <div className="space-y-4">
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

            {/* Main Filters - Collapsible Section */}
            <FilterSection
              title="Pagrindiniai filtrai"
              isExpanded={isDefaultFiltersExpanded}
              onToggle={() =>
                setIsDefaultFiltersExpanded(!isDefaultFiltersExpanded)
              }
            >
              {getFilterComponent(type, filters, updateFilters)}
            </FilterSection>

            {/* Filter Button */}
            {onFilter && (
              <Button
                className="w-full"
                onClick={() => {
                  onFilter();
                  setIsExpanded(false); // Collapse after filtering
                }}
                disabled={isLoading || !backendFilters}
              >
                {isLoading ? "Kraunama..." : "Filtruoti"}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
