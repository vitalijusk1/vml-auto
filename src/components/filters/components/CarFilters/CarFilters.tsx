import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CarFilters as CarFiltersType } from "@/utils/filterCars";
import { Car } from "@/types";
import { CategorySection } from "../CategorySection/CategorySection";
import { WheelsSection } from "../WheelsSection/WheelsSection";
import { useBackendFilters } from "@/hooks/useBackendFilters";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";

interface CarFiltersProps {
  filters: CarFiltersType;
  onFiltersChange: (updates: Partial<CarFiltersType>) => void;
  onReset: () => void;
  cars?: Car[];
}

export const CarFilters = ({
  filters: _filters,
  onFiltersChange: _onFiltersChange, // TODO: Use when sending selected categories to backend
  onReset,
  cars: _cars = [],
}: CarFiltersProps) => {
  const backendFilters = useAppSelector(selectBackendFilters);

  // Extract all filter options from backend using shared hook
  const { categories, wheelsFilters } = useBackendFilters();

  // Track selected category IDs
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  // Track selected wheel filter values
  const [selectedWheelFilters, setSelectedWheelFilters] = useState<
    Record<string, string[]>
  >({});

  // Handle category selection
  const handleCategoryToggle = (categoryId: number) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Handle wheel filter changes
  const handleWheelFilterChange = (filterKey: string, selected: string[]) => {
    setSelectedWheelFilters((prev) => ({
      ...prev,
      [filterKey]: selected,
    }));
  };

  const hasFilters = backendFilters && Object.keys(backendFilters).length > 0;
  const hasWheels = wheelsFilters && Object.keys(wheelsFilters).length > 0;

  return (
    <CardContent className="space-y-6">
      {!hasFilters ? (
        <p className="text-muted-foreground text-sm">
          No filters available. Filters will be loaded from the backend.
        </p>
      ) : (
        <>
          {/* Categories Section */}
          <CategorySection
            categories={categories}
            selectedCategories={selectedCategories}
            onCategoryToggle={handleCategoryToggle}
          />

          {/* Wheels Section */}
          {hasWheels && wheelsFilters && (
            <WheelsSection
              wheels={wheelsFilters}
              selectedFilters={selectedWheelFilters}
              onFilterChange={handleWheelFilterChange}
            />
          )}
        </>
      )}

      <Button variant="outline" className="w-full" onClick={onReset}>
        Clear All Filters
      </Button>
    </CardContent>
  );
};
