import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectFilters, selectCars, selectParts } from "@/store/selectors";
import { setFilters, resetFilters } from "@/store/slices/filtersSlice";
import { PartStatus, PartQuality } from "@/types";
import { X, Filter } from "lucide-react";
import { useState, useMemo } from "react";

export function FilterPanel() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const cars = useAppSelector(selectCars);
  const parts = useAppSelector(selectParts);
  const [isOpen, setIsOpen] = useState(true);

  const uniqueBrands = useMemo(() => {
    return Array.from(new Set(cars.map((c) => c.brand))).sort();
  }, [cars]);

  const uniqueModels = useMemo(() => {
    if (filters.carBrand.length === 0) {
      return Array.from(new Set(cars.map((c) => c.model))).sort();
    }
    return Array.from(
      new Set(
        cars
          .filter((c) => filters.carBrand.includes(c.brand))
          .map((c) => c.model)
      )
    ).sort();
  }, [cars, filters.carBrand]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(parts.map((p) => p.category))).sort();
  }, [parts]);

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
              placeholder="Part name, code, manufacturer..."
              value={filters.search}
              onChange={(e) => dispatch(setFilters({ search: e.target.value }))}
            />
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select
              value={filters.status}
              onChange={(e) =>
                dispatch(
                  setFilters({ status: e.target.value as PartStatus | "All" })
                )
              }
            >
              <option value="All">All</option>
              <option value="In Stock">In Stock</option>
              <option value="Reserved">Reserved</option>
              <option value="Sold">Sold</option>
              <option value="Returned">Returned</option>
            </Select>
          </div>

          {/* Car Brand */}
          <div>
            <label className="text-sm font-medium mb-2 block">Car Brand</label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {uniqueBrands.map((brand) => (
                <label
                  key={brand}
                  className="flex items-center space-x-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.carBrand.includes(brand)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        dispatch(
                          setFilters({ carBrand: [...filters.carBrand, brand] })
                        );
                      } else {
                        dispatch(
                          setFilters({
                            carBrand: filters.carBrand.filter(
                              (b) => b !== brand
                            ),
                          })
                        );
                      }
                    }}
                    className="rounded"
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Car Model */}
          <div>
            <label className="text-sm font-medium mb-2 block">Car Model</label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {uniqueModels.map((model) => (
                <label
                  key={model}
                  className="flex items-center space-x-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.carModel.includes(model)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        dispatch(
                          setFilters({ carModel: [...filters.carModel, model] })
                        );
                      } else {
                        dispatch(
                          setFilters({
                            carModel: filters.carModel.filter(
                              (m) => m !== model
                            ),
                          })
                        );
                      }
                    }}
                    className="rounded"
                  />
                  <span>{model}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Car Year */}
          <div>
            <label className="text-sm font-medium mb-2 block">Car Year</label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {uniqueYears.map((year) => (
                <label
                  key={year}
                  className="flex items-center space-x-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.carYear.includes(year)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        dispatch(
                          setFilters({ carYear: [...filters.carYear, year] })
                        );
                      } else {
                        dispatch(
                          setFilters({
                            carYear: filters.carYear.filter((y) => y !== year),
                          })
                        );
                      }
                    }}
                    className="rounded"
                  />
                  <span>{year}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Part Category */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Part Category
            </label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {uniqueCategories.map((category) => (
                <label
                  key={category}
                  className="flex items-center space-x-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.partCategory.includes(category)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        dispatch(
                          setFilters({
                            partCategory: [...filters.partCategory, category],
                          })
                        );
                      } else {
                        dispatch(
                          setFilters({
                            partCategory: filters.partCategory.filter(
                              (c) => c !== category
                            ),
                          })
                        );
                      }
                    }}
                    className="rounded"
                  />
                  <span>{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <label className="text-sm font-medium mb-2 block">Quality</label>
            <div className="max-h-32 overflow-y-auto border rounded-md p-2 space-y-1">
              {(
                ["New", "Used", "With Defects", "Restored"] as PartQuality[]
              ).map((quality) => (
                <label
                  key={quality}
                  className="flex items-center space-x-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={filters.quality.includes(quality)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        dispatch(
                          setFilters({ quality: [...filters.quality, quality] })
                        );
                      } else {
                        dispatch(
                          setFilters({
                            quality: filters.quality.filter(
                              (q) => q !== quality
                            ),
                          })
                        );
                      }
                    }}
                    className="rounded"
                  />
                  <span>{quality}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Price Range (EUR)
            </label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.priceRange.min || ""}
                onChange={(e) =>
                  dispatch(
                    setFilters({
                      priceRange: {
                        ...filters.priceRange,
                        min: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  )
                }
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.priceRange.max || ""}
                onChange={(e) =>
                  dispatch(
                    setFilters({
                      priceRange: {
                        ...filters.priceRange,
                        max: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      },
                    })
                  )
                }
              />
            </div>
          </div>

          {/* Inventory Age Quick Filters */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Inventory Age
            </label>
            <div className="space-y-2">
              <Button
                variant={
                  filters.inventoryAge.quickFilter === "stale"
                    ? "default"
                    : "outline"
                }
                size="sm"
                className="w-full"
                onClick={() =>
                  dispatch(
                    setFilters({
                      inventoryAge: {
                        quickFilter:
                          filters.inventoryAge.quickFilter === "stale"
                            ? undefined
                            : "stale",
                      },
                    })
                  )
                }
              >
                Stale (6+ months)
              </Button>
              <Button
                variant={
                  filters.inventoryAge.quickFilter === "new"
                    ? "default"
                    : "outline"
                }
                size="sm"
                className="w-full"
                onClick={() =>
                  dispatch(
                    setFilters({
                      inventoryAge: {
                        quickFilter:
                          filters.inventoryAge.quickFilter === "new"
                            ? undefined
                            : "new",
                      },
                    })
                  )
                }
              >
                New Arrivals (&lt; 1 month)
              </Button>
            </div>
          </div>

          {/* Reset Filters */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => dispatch(resetFilters())}
          >
            Clear All Filters
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
