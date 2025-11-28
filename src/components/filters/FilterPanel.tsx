import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FilterState, TopDetailsFilter } from "@/types";
import { Filter, RotateCcw } from "lucide-react";
import { SingleSelectDropdown } from "@/components/ui/SingleSelectDropdown";
import { useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { LayoutType } from "./type";
import { CategorySection } from "./components/CategorySection/CategorySection";
import { WheelsSection } from "./components/WheelsSection/WheelsSection";
import { FilterSection } from "./components/FilterSection/FilterSection";
import { MobileFilterPanel } from "./MobileFilterPanel";
import { useFilterPanelLogic } from "@/components/filters/useFilterPanelLogic";
import { getFilterComponent } from "./getFilterComponent";

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
  const isMobile = useIsMobile();
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
    defaultFiltersCount,
    hasDefaultFiltersSelection,
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
            Filtrai
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
          {getFilterComponent(type, filters, updateFilters)}
        </FilterSection>

        {/* Filter Button */}
        {onFilter && (
          <div className="flex justify-end pt-2">
            <Button
              className="px-6"
              onClick={onFilter}
              disabled={
                isLoading ||
                (type === LayoutType.ORDER_CONTROL
                  ? !(filters as FilterState).carBrand?.length ||
                    !(filters as FilterState).carModel?.length
                  : type !== LayoutType.ANALYTICS && !backendFilters)
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
