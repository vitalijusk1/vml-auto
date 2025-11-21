import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectBackendFilters,
  selectOrderControlSelectedCarId,
} from "@/store/selectors";
import {
  setOrderControlSelectedCarId,
  clearOrderControlSelectedCarId,
} from "@/store/slices/uiSlice";
import { getPreorderAnalysis } from "@/api/preorder";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SingleSelectDropdown } from "@/components/ui/SingleSelectDropdown";
import { Filter, RotateCcw, Download } from "lucide-react";
import { Car, Part } from "@/types";
import { CategoryPartsTable } from "../../components/tables/components/CategoryPartsTable";
import { Category } from "@/utils/backendFilters";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import { OrderControlFilterCard } from "./components/OrderControlFilterCard";
import { usePDFExport } from "@/hooks/usePDFExport";

export function OrderControlView() {
  const dispatch = useAppDispatch();
  const backendFilters = useAppSelector(selectBackendFilters);
  const selectedCarId = useAppSelector(selectOrderControlSelectedCarId);

  const [cars, setCars] = useState<Car[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  // Categories are fetched but not displayed in the table (kept for potential future use)
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());

  // Update filters when cars are updated (filters are managed by filter card)
  const handleCarsUpdate = useCallback(
    (newCars: Car[]) => {
      setCars(newCars);
      // Clear car selection when new cars are fetched
      dispatch(clearOrderControlSelectedCarId());
      setParts([]);
      setCategories([]);
    },
    [dispatch]
  );

  // Generate car options for dropdown
  const carOptions = useMemo(() => {
    return [
      { value: "", label: "Visi" },
      ...cars.map((car) => {
        // Build a descriptive label with key distinguishing features
        const parts: string[] = [
          car.brand.name,
          car.model.name,
          `(${car.year})`,
        ];

        // Add fuel type if available
        if (car.fuel?.name) {
          parts.push(car.fuel.name);
        }

        // Add engine capacity if available
        if (car.engine?.capacity) {
          parts.push(`${car.engine.capacity}cc`);
        }

        // Add body type if available (helps distinguish E90 vs E91, etc.)
        if (car.body_type?.name) {
          parts.push(car.body_type.name);
        }

        return {
          value: car.id.toString(),
          label: parts.join(" "),
        };
      }),
    ];
  }, [cars]);

  const handleClearCarSelection = useCallback(() => {
    dispatch(clearOrderControlSelectedCarId());
    setParts([]);
    setCategories([]);
  }, [dispatch]);

  // Function to fetch preorder analysis data for selected car
  const fetchPreorderAnalysis = useCallback(async () => {
    // Prevent concurrent fetches
    if (isLoadingParts) {
      return;
    }

    if (!selectedCarId) {
      setParts([]);
      setCategories([]);
      return;
    }

    setIsLoadingParts(true);

    try {
      const selectedCar = cars.find((c) => c.id.toString() === selectedCarId);
      if (!selectedCar || !backendFilters) {
        setParts([]);
        setCategories([]);
        return;
      }

      // Build API parameters
      const brandId = selectedCar.brand.id;

      const params: {
        brand_id: number;
        model_id: number;
        year: number;
        fuel_id?: number;
        engine_volume?: string;
        engine_volume_min?: number;
        engine_volume_max?: number;
        date_from?: string;
        date_to?: string;
      } = {
        brand_id: brandId,
        model_id: selectedCar.model.id,
        year: selectedCar.year,
      };

      // Add fuel ID if available from car
      if (selectedCar.fuel?.id) {
        params.fuel_id = selectedCar.fuel.id;
      }

      // Add engine volume if available from car
      if (selectedCar.engine?.capacity) {
        params.engine_volume = selectedCar.engine.capacity.toString();
      }

      // Add default date range (last year)
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      params.date_from = oneYearAgo.toISOString().split("T")[0];
      params.date_to = today.toISOString().split("T")[0];

      // Fetch preorder analysis data
      const result = await getPreorderAnalysis(params);
      setParts(result.parts);
      setCategories(result.categories);
    } catch (error) {
      console.error("Error fetching preorder analysis:", error);
      setParts([]);
      setCategories([]);
    } finally {
      setIsLoadingParts(false);
    }
  }, [selectedCarId, cars, backendFilters, isLoadingParts]);

  // Clear parts when car selection changes (to avoid showing stale data)
  useEffect(() => {
    setParts([]);
    setCategories([]);
  }, [selectedCarId]);

  // Fetch parts when a car is selected
  useEffect(() => {
    const fetchPartsForSelectedCar = async () => {
      if (
        !selectedCarId ||
        cars.length === 0 ||
        !backendFilters ||
        isLoadingParts
      ) {
        return;
      }

      // Check if the selected car exists in the cars list
      const selectedCar = cars.find((c) => c.id.toString() === selectedCarId);
      if (selectedCar) {
        await fetchPreorderAnalysis();
      }
    };

    fetchPartsForSelectedCar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCarId, cars.length, backendFilters]);

  // Get selected car for PDF export
  const selectedCar = useMemo(
    () => cars.find((c) => c.id.toString() === selectedCarId),
    [cars, selectedCarId]
  );

  // PDF export hook
  const { handleDownloadPDF } = usePDFExport({
    parts,
    selectedParts,
    selectedCar: selectedCar || null,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Užsakymų valdymas"
        description="Valdykite ir filtruokite užsakymus"
      />

      {backendFilters && (
        <OrderControlFilterCard
          onCarsUpdate={handleCarsUpdate}
          backendFilters={backendFilters}
        />
      )}

      {/* Car Selection Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Automobilio pasirinkimas
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCarSelection}
              disabled={!selectedCarId}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Išvalyti
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Automobilis
              <span className="text-destructive ml-1">*</span>
            </label>
            <SingleSelectDropdown
              options={carOptions}
              value={selectedCarId}
              onChange={(value) =>
                dispatch(setOrderControlSelectedCarId(value))
              }
              placeholder={
                cars.length === 0
                  ? "Pirmiausia pasirinkite filtrus ir spustelėkite 'Filtruoti'"
                  : "Pasirinkite automobilį"
              }
              disabled={cars.length === 0}
            />
            {cars.length === 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                Nėra automobilių. Pasirinkite filtrus ir spustelėkite
                "Filtruoti".
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Category Parts Table - Only show when car is selected and we have data */}
      {selectedCarId &&
        (parts.length > 0 || categories.length > 0 || isLoadingParts) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Kategorijos ir detalės</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Table Controls Toolbar */}
              <div className="mb-4 pb-4 border-b">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadPDF}
                    disabled={selectedParts.size === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Atsisiųsti .pdf ({selectedParts.size})
                  </Button>
                </div>
              </div>
              {isLoadingParts ? (
                <LoadingState message="Kraunami duomenys..." />
              ) : parts.length > 0 && categories.length > 0 ? (
                <CategoryPartsTable
                  parts={parts}
                  categories={categories}
                  selectedCarId={selectedCarId || ""}
                  backendFilters={backendFilters}
                  onSelectionChange={(_selectedCats, selectedPts) => {
                    setSelectedParts(selectedPts);
                  }}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {parts.length === 0 && categories.length > 0
                    ? "Nerasta dalių šiam automobiliui"
                    : "Pasirinkite automobilį ir spustelėkite 'Filtruoti', kad matytumėte duomenis"}
                </div>
              )}
            </CardContent>
          </Card>
        )}
    </div>
  );
}
