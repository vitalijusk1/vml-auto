import { useState, useMemo } from "react";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CarFilters as CarFiltersType } from "@/utils/filterCars";
import { Car } from "@/types";
import { CategorySection } from "../CategorySection/CategorySection";
import { WheelsSection } from "../WheelsSection/WheelsSection";

interface CarFiltersProps {
  filters: CarFiltersType;
  onFiltersChange: (updates: Partial<CarFiltersType>) => void;
  onReset: () => void;
  cars?: Car[];
}

export const CarFilters = ({
  filters,
  onFiltersChange: _onFiltersChange, // TODO: Use when sending selected categories to backend
  onReset,
  cars: _cars = [],
}: CarFiltersProps) => {
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

  // Extract categories from filters
  const categories = useMemo(() => {
    if (filters?.categories && Array.isArray(filters.categories)) {
      return filters.categories;
    }
    return [];
  }, [filters]);

  // Extract wheels from filters
  const wheels = useMemo(() => {
    if (filters?.wheels && typeof filters.wheels === "object") {
      return filters.wheels;
    }
    return undefined;
  }, [filters]);

  const hasFilters = filters && Object.keys(filters).length > 0;
  const hasWheels = wheels && Object.keys(wheels).length > 0;

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
          {hasWheels && (
            <WheelsSection
              wheels={wheels}
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
