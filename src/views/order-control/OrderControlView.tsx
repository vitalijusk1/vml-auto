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
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SingleSelectDropdown } from "@/components/ui/SingleSelectDropdown";
import { Filter, RotateCcw, Download } from "lucide-react";
import { Car, Part } from "@/types";
import { CategoryPartsTable } from "../../components/tables/components/CategoryPartsTable";
import { Category } from "@/utils/backendFilters";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import { OrderControlFilterCard } from "./components/OrderControlFilterCard";
import { loadPersistedFilters } from "@/utils/storageHelpers";
import { StorageKeys } from "@/utils/storageKeys";
import type { FilterState } from "@/types";

// Initialize pdfMake with fonts
if (pdfFonts && (pdfFonts as any).pdfMake && (pdfFonts as any).pdfMake.vfs) {
  pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;
}

export function OrderControlView() {
  const dispatch = useAppDispatch();
  const backendFilters = useAppSelector(selectBackendFilters);
  const selectedCarId = useAppSelector(selectOrderControlSelectedCarId);

  const [cars, setCars] = useState<Car[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  // Categories are fetched but not displayed in the table (kept for potential future use)
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    new Set()
  );
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());

  // Ref to track latest filters for fetchPreorderAnalysis (needed for engine capacity range)
  const filtersRef = useRef<FilterState>(
    loadPersistedFilters(StorageKeys.ORDER_CONTROL_STATE)
  );

  // Update filters ref when cars are updated (filters are managed by filter card)
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

  // Note: Orders are fetched in OrdersView and stored in Redux
  // We just use them from Redux here - no need to fetch again

  // Sync filters ref when filter card updates filters (needed for fetchPreorderAnalysis)
  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    filtersRef.current = newFilters;
  }, []);

  // Initial sync from sessionStorage
  useEffect(() => {
    filtersRef.current = loadPersistedFilters(StorageKeys.ORDER_CONTROL_STATE);
  }, []);

  // Generate car options for dropdown
  const carOptions = useMemo(() => {
    return [
      { value: "", label: "Visi" },
      ...cars.map((car) => {
        // Build a descriptive label with key distinguishing features
        const parts: string[] = [car.brand.name, car.model.name, `(${car.year})`];

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

      // Add fuel ID if available (prefer from car, fallback to filters)
      if (selectedCar.fuel?.id) {
        params.fuel_id = selectedCar.fuel.id;
      } else if (
        filtersRef.current.fuelType &&
        filtersRef.current.fuelType.length > 0
      ) {
        const fuelTypeName = filtersRef.current.fuelType[0];
        const backendFiltersData = backendFilters as any;
        if (
          backendFiltersData?.car?.fuels &&
          Array.isArray(backendFiltersData.car.fuels)
        ) {
          for (const fuel of backendFiltersData.car.fuels) {
            const name =
              typeof fuel === "string"
                ? fuel
                : fuel.languages?.en ||
                  fuel.languages?.name ||
                  fuel.name ||
                  fuel;
            if (name === fuelTypeName) {
              const fuelId =
                typeof fuel === "string" ? undefined : fuel.id || fuel.rrr_id;
              if (fuelId) {
                params.fuel_id = fuelId;
              }
              break;
            }
          }
        }
      }

      // Add engine volume if available
      if (selectedCar.engine?.capacity) {
        params.engine_volume = selectedCar.engine.capacity.toString();
      } else if (filtersRef.current.engineCapacityRange) {
        if (filtersRef.current.engineCapacityRange.min !== undefined) {
          params.engine_volume_min = filtersRef.current.engineCapacityRange.min;
        }
        if (filtersRef.current.engineCapacityRange.max !== undefined) {
          params.engine_volume_max = filtersRef.current.engineCapacityRange.max;
        }
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

  // Collect all parts to export (selected parts, or all parts if none selected)
  const getPartsToExport = (): Part[] => {
    if (selectedParts.size > 0) {
      // Return only selected parts
      return parts.filter((part) => selectedParts.has(part.id));
    }
    // If no parts selected, export all parts
    return parts;
  };

  const handleDownloadPDF = () => {
    const partsToExport = getPartsToExport();

    if (partsToExport.length === 0) {
      alert("Nėra dalių eksportui");
      return;
    }

    // Build parts table data
    const tableBody = partsToExport.map((part) => {
      const soldCount = part.analysisStatusCounts?.sold ?? 0;

      return [
        part.category || "-",
        part.name || "-",
        part.code || "-",
        part.manufacturerCode || "-",
        part.status || "-",
        part.status === "In Stock" ? "1" : "0",
        soldCount.toString(),
        `${part.priceEUR} €`,
        part.warehouse || "-",
      ];
    });

    // Selected car info
    const selectedCar = cars.find((c) => c.id.toString() === selectedCarId);
    const carInfo = selectedCar
      ? `${selectedCar.brand.name} ${selectedCar.model.name} (${selectedCar.year})`
      : "";

    // Build PDF document definition
    const docDefinition: any = {
      content: [
        {
          text: "Detalių ataskaita",
          style: "header",
          margin: [0, 0, 0, 10],
        },
        ...(carInfo
          ? [
              {
                text: `Automobilis: ${carInfo}`,
                fontSize: 12,
                margin: [0, 0, 0, 5],
              },
            ]
          : []),
        {
          text: `Eksportuota: ${new Date().toLocaleString("lt-LT")}`,
          fontSize: 10,
          italics: true,
          margin: [0, 0, 0, 15],
        },
        ...(tableBody.length > 0
          ? [
              {
                text: "Detalės",
                style: "subheader",
                margin: [0, 10, 0, 5],
              },
              {
                table: {
                  headerRows: 1,
                  widths: [
                    "*",
                    "*",
                    "auto",
                    "auto",
                    "auto",
                    "auto",
                    "auto",
                    "auto",
                    "auto",
                  ],
                  body: [
                    [
                      "Kategorija",
                      "Pavadinimas",
                      "Kodas",
                      "Gamintojo kodas",
                      "Statusas",
                      "Likutis",
                      "Parduota",
                      "Kaina",
                      "Sandėlys",
                    ],
                    ...tableBody,
                  ],
                },
                layout: {
                  fillColor: (rowIndex: number) => {
                    if (rowIndex === 0) return "#c8c8c8";
                    return rowIndex % 2 === 0 ? "#f5f5f5" : null;
                  },
                },
                fontSize: 9,
              },
            ]
          : []),
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
        },
        subheader: {
          fontSize: 14,
          bold: true,
        },
      },
      defaultStyle: {
        font: "Roboto",
      },
    };

    // Generate and download PDF
    pdfMake
      .createPdf(docDefinition)
      .download(`ataskaita_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Užsakymų valdymas"
        description="Valdykite ir filtruokite užsakymus"
      />

      {backendFilters && (
        <OrderControlFilterCard
          onCarsUpdate={handleCarsUpdate}
          onFiltersChange={handleFiltersChange}
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
                  onSelectionChange={(selectedCats, selectedPts) => {
                    setSelectedCategories(selectedCats);
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
