import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { selectCars } from "@/store/selectors";
import { FuelType, BodyType } from "@/types";
import { X, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import { CarFilterState, defaultCarFilters } from "@/utils/filterCars";

interface CarFilterPanelProps {
  filters: CarFilterState;
  onFiltersChange: (filters: CarFilterState) => void;
}

export function CarFilterPanel({
  filters,
  onFiltersChange,
}: CarFilterPanelProps) {
  const cars = useAppSelector(selectCars);
  const [isOpen, setIsOpen] = useState(true);

  const updateFilters = (updates: Partial<CarFilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const resetFilters = () => {
    onFiltersChange(defaultCarFilters);
  };

  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.brand))).sort();
  }, [cars]);

  const uniqueModels = useMemo(() => {
    if (filters.brand.length === 0) {
      return Array.from(new Set(cars.map((c) => c.model.name))).sort();
    }
    return Array.from(
      new Set(
        cars
          .filter((c) => filters.brand.includes(c.brand))
          .map((c) => c.model.name)
      )
    ).sort();
  }, [cars, filters.brand]);

  const uniqueYears = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.year))).sort((a, b) => b - a);
  }, [cars]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="space-y-4">
          {/* Search */}
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <Input
              placeholder="Brand, model, ID, engine code..."
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>

          {/* Brand */}
          <div>
            <label className="text-sm font-medium mb-2 block">Brand</label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {uniqueBrands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center space-x-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.brand.includes(brand)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilters({ brand: [...filters.brand, brand] });
                      } else {
                        updateFilters({
                          brand: filters.brand.filter((b) => b !== brand),
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Model */}
          <div>
            <label className="text-sm font-medium mb-2 block">Model</label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {uniqueModels.map((model) => (
                <label
                  key={model}
                  className="flex items-center space-x-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.model.includes(model)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilters({ model: [...filters.model, model] });
                      } else {
                        updateFilters({
                          model: filters.model.filter((m) => m !== model),
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span>{model}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="text-sm font-medium mb-2 block">Year</label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {uniqueYears.map((year) => (
                <label
                  key={year}
                  className="flex items-center space-x-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.year.includes(year)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilters({ year: [...filters.year, year] });
                      } else {
                        updateFilters({
                          year: filters.year.filter((y) => y !== year),
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span>{year}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Fuel Type</label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {(["Petrol", "Diesel", "Electric", "Hybrid"] as FuelType[]).map(
                (fuelType) => (
                  <label
                    key={fuelType}
                    className="flex items-center space-x-2 text-sm cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.fuelType.includes(fuelType)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateFilters({
                            fuelType: [...filters.fuelType, fuelType],
                          });
                        } else {
                          updateFilters({
                            fuelType: filters.fuelType.filter(
                              (f) => f !== fuelType
                            ),
                          });
                        }
                      }}
                      className="rounded"
                    />
                    <span>{fuelType}</span>
                  </label>
                )
              )}
            </div>
          </div>

          {/* Body Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Body Type</label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {(
                [
                  "Sedan",
                  "Hatchback",
                  "SUV",
                  "Coupe",
                  "Estate",
                  "Van",
                ] as BodyType[]
              ).map((bodyType) => (
                <label
                  key={bodyType}
                  className="flex items-center space-x-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.bodyType.includes(bodyType)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        updateFilters({
                          bodyType: [...filters.bodyType, bodyType],
                        });
                      } else {
                        updateFilters({
                          bodyType: filters.bodyType.filter(
                            (b) => b !== bodyType
                          ),
                        });
                      }
                    }}
                    className="rounded"
                  />
                  <span>{bodyType}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Mileage Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Mileage (km)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.mileageRange.min || ""}
                onChange={(e) =>
                  updateFilters({
                    mileageRange: {
                      ...filters.mileageRange,
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
                value={filters.mileageRange.max || ""}
                onChange={(e) =>
                  updateFilters({
                    mileageRange: {
                      ...filters.mileageRange,
                      max: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Date Synced Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Last Synced
            </label>
            <div className="space-y-2">
              <Input
                type="date"
                value={
                  filters.dateSyncedRange.from
                    ? filters.dateSyncedRange.from.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  updateFilters({
                    dateSyncedRange: {
                      ...filters.dateSyncedRange,
                      from: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    },
                  })
                }
              />
              <Input
                type="date"
                value={
                  filters.dateSyncedRange.to
                    ? filters.dateSyncedRange.to.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  updateFilters({
                    dateSyncedRange: {
                      ...filters.dateSyncedRange,
                      to: e.target.value ? new Date(e.target.value) : undefined,
                    },
                  })
                }
              />
            </div>
          </div>

          {/* Reset Filters */}
          <Button variant="outline" className="w-full" onClick={resetFilters}>
            Clear All Filters
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
