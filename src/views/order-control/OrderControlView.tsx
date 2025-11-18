import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectBackendFilters,
  selectOrders,
  selectOrderControlSelectedCarId,
} from "@/store/selectors";
import {
  setOrderControlSelectedCarId,
  clearOrderControlSelectedCarId,
} from "@/store/slices/uiSlice";
import { getCars } from "@/api/cars";
import { getOrders } from "@/api/orders";
import { setOrders } from "@/store/slices/dataSlice";
import { getPreorderAnalysis } from "@/api/preorder";
import { FilterPanel } from "../../components/filters/FilterPanel";
import { useEffect, useState, useMemo, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SingleSelectDropdown } from "@/components/ui/SingleSelectDropdown";
import { Filter, RotateCcw, Download } from "lucide-react";
import { Car, Part, FilterState } from "@/types";
import { CategoryPartsTable } from "../../components/tables/components/CategoryPartsTable";
import { Category } from "@/utils/backendFilters";
import { defaultFilters } from "@/store/slices/filtersSlice";
import {
  mapBrandNameToId,
  mapModelNameToId,
  mapFuelTypeNameToId,
} from "@/utils/filterMappers";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingState } from "@/components/ui/LoadingState";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";

// Initialize pdfMake with fonts
if (pdfFonts && (pdfFonts as any).pdfMake && (pdfFonts as any).pdfMake.vfs) {
  pdfMake.vfs = (pdfFonts as any).pdfMake.vfs;
}

const ORDER_CONTROL_STORAGE_KEY = "orderControlState";

interface PersistedOrderControlState {
  filters: {
    carBrand?: FilterState["carBrand"];
    carModel?: FilterState["carModel"];
    fuelType?: FilterState["fuelType"];
    engineCapacity?: FilterState["engineCapacity"];
    yearRange?: FilterState["yearRange"];
  };
}

const cloneDefaultFilters = (): FilterState =>
  JSON.parse(JSON.stringify(defaultFilters)) as FilterState;

export function OrderControlView() {
  const dispatch = useAppDispatch();
  const backendFilters = useAppSelector(selectBackendFilters);
  const orders = useAppSelector(selectOrders);
  const selectedCarId = useAppSelector(selectOrderControlSelectedCarId);
  const [cars, setCars] = useState<Car[]>([]);
  const [parts, setParts] = useState<Part[]>([]);
  // Categories are fetched but not displayed in the table (kept for potential future use)
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCars, setIsLoadingCars] = useState(false);
  const [isLoadingParts, setIsLoadingParts] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [hasRestored, setHasRestored] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    new Set()
  );
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());
  const [orderFilters, setOrderFilters] = useState<FilterState>(
    cloneDefaultFilters()
  );
  // Ref to prevent double execution in React Strict Mode
  const restoreInProgressRef = useRef(false);
  // Ref to track if we're currently fetching cars to prevent concurrent fetches
  const fetchCarsInProgressRef = useRef(false);
  // Ref to track if we're currently fetching preorder analysis to prevent concurrent fetches
  const fetchPreorderAnalysisInProgressRef = useRef(false);
  // Ref to track if we've already fetched cars during restoration (prevent duplicate fetches)
  const hasFetchedCarsDuringRestoreRef = useRef(false);

  // Load persisted state on mount (only once)
  // Note: Only filters are persisted, cars and selectedCarId are NOT persisted
  useEffect(() => {
    const loadPersistedState = () => {
      try {
        const stored = localStorage.getItem(ORDER_CONTROL_STORAGE_KEY);
        if (stored) {
          const persistedState: PersistedOrderControlState = JSON.parse(stored);

          // Restore only filters, not cars (user will click "Filtruoti" to fetch cars)
          if (persistedState.filters) {
            setOrderFilters((prev) => ({
              ...prev,
              carBrand: persistedState.filters.carBrand || [],
              carModel: persistedState.filters.carModel || [],
              fuelType: persistedState.filters.fuelType || [],
              engineCapacity: persistedState.filters.engineCapacity,
              yearRange:
                persistedState.filters.yearRange || prev.yearRange || {},
            }));
          }
        }
      } catch (error) {
        console.error("Error loading persisted state:", error);
      } finally {
        setIsRestoring(false);
      }
    };

    loadPersistedState();
  }, []);

  // Note: selectedCarId is not persisted, so no need to validate it on restore

  // Validate persisted state matches current filters
  useEffect(() => {
    if (isRestoring) return;

    try {
      const stored = localStorage.getItem(ORDER_CONTROL_STORAGE_KEY);
      if (stored) {
        const persistedState: PersistedOrderControlState = JSON.parse(stored);

        // Check if persisted filters match current filters
        const filtersMatch =
          JSON.stringify(persistedState.filters?.carBrand || []) ===
            JSON.stringify(orderFilters.carBrand || []) &&
          JSON.stringify(persistedState.filters?.carModel || []) ===
            JSON.stringify(orderFilters.carModel || []) &&
          JSON.stringify(persistedState.filters?.fuelType || []) ===
            JSON.stringify(orderFilters.fuelType || []) &&
          JSON.stringify(persistedState.filters?.engineCapacity || []) ===
            JSON.stringify(orderFilters.engineCapacity || []) &&
          JSON.stringify(persistedState.filters?.yearRange || {}) ===
            JSON.stringify(orderFilters.yearRange || {});

        // If filters don't match, clear everything
        if (!filtersMatch) {
          setCars([]);
          dispatch(clearOrderControlSelectedCarId());
          setParts([]);
          setCategories([]);
          // Clear persisted state when filters change
          localStorage.removeItem(ORDER_CONTROL_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error("Error validating persisted state:", error);
    }
  }, [
    orderFilters.carBrand,
    orderFilters.carModel,
    orderFilters.fuelType,
    orderFilters.engineCapacity,
    orderFilters.yearRange,
    isRestoring,
    dispatch,
  ]);

  // Save state to localStorage whenever it changes
  // Note: Only filters are persisted, cars and selectedCarId are NOT persisted
  useEffect(() => {
    if (!isRestoring) {
      try {
        const stateToSave: PersistedOrderControlState = {
          filters: {
            carBrand: orderFilters.carBrand,
            carModel: orderFilters.carModel,
            fuelType: orderFilters.fuelType,
            engineCapacity: orderFilters.engineCapacity,
            yearRange: orderFilters.yearRange,
          },
        };
        localStorage.setItem(
          ORDER_CONTROL_STORAGE_KEY,
          JSON.stringify(stateToSave)
        );
      } catch (error) {
        console.error("Error saving state:", error);
      }
    }
  }, [
    orderFilters.carBrand,
    orderFilters.carModel,
    orderFilters.fuelType,
    orderFilters.engineCapacity,
    orderFilters.yearRange,
    isRestoring,
  ]);

  // Note: Filters are fetched in App.tsx on initial load, no need to fetch here

  // Fetch orders if not already in Redux
  useEffect(() => {
    const fetchOrdersData = async () => {
      if (orders.length === 0) {
        try {
          const ordersData = await getOrders();
          dispatch(setOrders(ordersData));
        } catch (error) {
          console.error("Error fetching orders:", error);
        }
      }
    };

    fetchOrdersData();
  }, [dispatch, orders.length]);

  // Function to fetch cars based on brand_id, car_model_id, and fuel_type (as IDs)
  // This gets ALL cars matching the selected filters
  // Returns the fetched cars array
  const fetchCars = async (
    carIdToPreserve?: string,
    skipDispatch?: boolean
  ): Promise<Car[]> => {
    // Prevent concurrent fetches
    if (fetchCarsInProgressRef.current) {
      // If a fetch is already in progress, return the current cars
      return cars;
    }

    // If we're in restoration mode and have a carIdToPreserve, ensure we don't clear it
    const isRestoringMode = restoreInProgressRef.current || skipDispatch;

    // Validate required filters
    if (
      !orderFilters.carBrand ||
      orderFilters.carBrand.length === 0 ||
      !orderFilters.carModel ||
      orderFilters.carModel.length === 0 ||
      !backendFilters
    ) {
      return [];
    }

    // Use provided carIdToPreserve, or current selectedCarId if not provided
    // If carIdToPreserve is explicitly undefined, use selectedCarId (preserve current selection)
    // If carIdToPreserve is empty string "", clear selection
    // If carIdToPreserve is a non-empty string, use that specific ID
    // During restoration, we always pass carIdToPreserve explicitly, so this should use that value
    const currentSelectedCarId =
      carIdToPreserve === undefined
        ? selectedCarId
        : carIdToPreserve === ""
        ? ""
        : carIdToPreserve;

    fetchCarsInProgressRef.current = true;
    setIsLoadingCars(true);
    try {
      // Convert brand names to IDs
      const brandIds: number[] = [];
      if (orderFilters.carBrand && orderFilters.carBrand.length > 0) {
        for (const brandName of orderFilters.carBrand) {
          const brandId = mapBrandNameToId(brandName, backendFilters);
          if (brandId !== undefined) {
            brandIds.push(brandId);
          }
        }
      }

      // Convert model names to IDs
      // Pass selected brand names to help narrow down the search
      const modelIds: number[] = [];
      if (orderFilters.carModel && orderFilters.carModel.length > 0) {
        for (const modelName of orderFilters.carModel) {
          const modelId = mapModelNameToId(
            modelName,
            backendFilters,
            orderFilters.carBrand || undefined
          );
          if (modelId !== undefined) {
            modelIds.push(modelId);
          }
        }
      }

      // Convert fuel type names to IDs
      const fuelIds: number[] = [];
      if (orderFilters.fuelType && orderFilters.fuelType.length > 0) {
        for (const fuelTypeName of orderFilters.fuelType) {
          const fuelId = mapFuelTypeNameToId(fuelTypeName, backendFilters);
          if (fuelId !== undefined) {
            fuelIds.push(fuelId);
          }
        }
      }

      // Build query params using IDs
      const queryParams: any = {
        page: 1,
        per_page: 1000, // Get all cars for selection
      };

      // Add brand_id filter (API accepts this even though not in TypeScript interface)
      if (brandIds.length > 0) {
        queryParams.brand_id = brandIds.length === 1 ? brandIds[0] : brandIds;
      }

      // Add car_model_id filter
      if (modelIds.length > 0) {
        queryParams.car_model_id =
          modelIds.length === 1 ? modelIds[0] : modelIds;
      }

      // Add car_fuel_id filter
      if (fuelIds.length > 0) {
        queryParams.car_fuel_id = fuelIds.length === 1 ? fuelIds[0] : fuelIds;
      }

      const response = await getCars(queryParams);
      setCars(response.cars);

      // If we have a car ID to preserve, check if it still exists in the new list
      if (currentSelectedCarId) {
        const carStillExists = response.cars.some(
          (car) => car.id.toString() === currentSelectedCarId
        );
        if (carStillExists) {
          // Keep the selection, don't clear parts/categories
          // Only dispatch if not skipping (during restoration, we handle dispatch separately)
          if (!skipDispatch) {
            dispatch(setOrderControlSelectedCarId(currentSelectedCarId));
          }
          // If skipDispatch is true but we have a carIdToPreserve, don't clear the selection
          // The selection should already be set in Redux before fetchCars was called
        } else {
          // Selected car no longer exists, clear everything
          if (!skipDispatch) {
            dispatch(clearOrderControlSelectedCarId());
          }
          // If skipDispatch is true, don't clear - let the caller handle it
          setParts([]);
          setCategories([]);
        }
      } else {
        // No car to preserve in currentSelectedCarId
        // BUT: if we're in restoration mode, check if selectedCarId exists in Redux
        // If it does, try to preserve it (it might have been set before fetchCars was called)
        if (isRestoringMode && selectedCarId) {
          // We're in restoration mode and have a selectedCarId in Redux
          // Check if this car exists in the fetched cars
          const carExists = response.cars.some(
            (car) => car.id.toString() === selectedCarId
          );
          if (carExists) {
            // Car exists, keep the selection (don't dispatch since skipDispatch is true)
            // Don't clear parts/categories during restoration
          } else {
            // Car doesn't exist in fetched cars, clear it
            if (!skipDispatch) {
              dispatch(clearOrderControlSelectedCarId());
            }
            setParts([]);
            setCategories([]);
          }
        } else {
          // Normal behavior: clear selected car when new cars are fetched
          if (!skipDispatch && !isRestoringMode) {
            dispatch(clearOrderControlSelectedCarId());
          }
          // Only clear parts/categories if we're not skipping dispatch and not in restoration
          if (!skipDispatch && !isRestoringMode) {
            setParts([]);
            setCategories([]);
          }
        }
      }

      return response.cars;
    } catch (error) {
      console.error("Error fetching cars:", error);
      setCars([]);
      return [];
    } finally {
      setIsLoadingCars(false);
      fetchCarsInProgressRef.current = false;
    }
  };

  // Clear cars and selection when filters change (but don't auto-fetch)
  // Don't clear during restore - wait until restore is complete
  useEffect(() => {
    if (!isRestoring && hasRestored) {
      setCars([]);
      dispatch(clearOrderControlSelectedCarId());
      setParts([]);
      setCategories([]);
      // Reset the ref so that normal filtering can fetch cars again
      hasFetchedCarsDuringRestoreRef.current = false;
      // Clear persisted state when filters change
      try {
        localStorage.removeItem(ORDER_CONTROL_STORAGE_KEY);
      } catch (error) {
        console.error("Error clearing persisted state:", error);
      }
    }
  }, [
    orderFilters.carBrand,
    orderFilters.carModel,
    orderFilters.yearRange,
    orderFilters.fuelType,
    orderFilters.engineCapacity,
    isRestoring,
    hasRestored,
  ]);

  // Generate car options for dropdown
  const carOptions = useMemo(() => {
    return [
      { value: "", label: "Visi" },
      ...cars.map((car) => {
        // Build a descriptive label with key distinguishing features
        const parts: string[] = [car.brand, car.model.name, `(${car.year})`];

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

  // Generate fake data for UI preview (removed - using real data now)
  // Keeping this commented out in case we need it for testing
  /* const generateFakeData = useMemo(() => {
    const fakeCategories: Category[] = [
      {
        id: 1,
        rrr_id: "1",
        name: "Valdikliai/elektronikos elementai",
        parent_id: "0",
        level: 0,
        languages: {
          en: "Controllers/electronic elements",
          lt: "Valdikliai/elektronikos elementai",
          id: "1",
          parent_id: "0",
          level: "0",
        },
        subcategories: [
          {
            id: 11,
            rrr_id: "11",
            name: "Radio antenos stiprintuvas",
            parent_id: "1",
            level: 1,
            languages: {
              en: "Radio antenna amplifier",
              lt: "Radio antenos stiprintuvas",
              id: "11",
              parent_id: "1",
              level: "1",
            },
            subcategories: [],
          },
        ],
      },
      {
        id: 2,
        rrr_id: "2",
        name: "Salonas/vidaus detalės",
        parent_id: "0",
        level: 0,
        languages: {
          en: "Interior/internal details",
          lt: "Salonas/vidaus detalės",
          id: "2",
          parent_id: "0",
          level: "0",
        },
        subcategories: [
          {
            id: 21,
            rrr_id: "21",
            name: "Kairės pusės rankena",
            parent_id: "2",
            level: 1,
            languages: {
              en: "Left side handle",
              lt: "Kairės pusės rankena",
              id: "21",
              parent_id: "2",
              level: "1",
            },
            subcategories: [],
          },
        ],
      },
    ];

    const fakeParts: Part[] = [
      {
        id: "1",
        code: "1332",
        name: "Radijos antenos stiprintuvas",
        category: "Radio antenos stiprintuvas",
        partType: "",
        carId: selectedCarId || "1",
        carBrand: "BMW",
        carModel: "320d",
        carYear: 2015,
        status: "In Stock",
        priceEUR: 40,
        pricePLN: 180,
        daysInInventory: 13,
        dateAdded: new Date(),
        photos: [],
        warehouse: "Sandėlys1",
        manufacturerCode: "1332",
      },
      {
        id: "2",
        code: "322",
        name: "Radijos antenos stiprintuvas",
        category: "Radio antenos stiprintuvas",
        partType: "",
        carId: selectedCarId || "1",
        carBrand: "BMW",
        carModel: "320d",
        carYear: 2015,
        status: "Reserved",
        priceEUR: 40,
        pricePLN: 180,
        daysInInventory: 23,
        dateAdded: new Date(),
        photos: [],
        warehouse: "Sandėlys1",
        manufacturerCode: "322",
      },
      {
        id: "3",
        code: "1433",
        name: "Radijos antenos stiprintuvas",
        category: "Radio antenos stiprintuvas",
        partType: "",
        carId: selectedCarId || "1",
        carBrand: "BMW",
        carModel: "320d",
        carYear: 2015,
        status: "In Stock",
        priceEUR: 40,
        pricePLN: 180,
        daysInInventory: 51,
        dateAdded: new Date(),
        photos: [],
        warehouse: "Sandėlys1",
        manufacturerCode: "1433",
      },
      {
        id: "4",
        code: "1433",
        name: "Kairės pusės rankena",
        category: "Kairės pusės rankena",
        partType: "",
        carId: selectedCarId || "1",
        carBrand: "BMW",
        carModel: "320d",
        carYear: 2015,
        status: "In Stock",
        priceEUR: 23,
        pricePLN: 103.5,
        daysInInventory: 51,
        dateAdded: new Date(),
        photos: [],
        warehouse: "Sandėlys1",
        manufacturerCode: "1433",
      },
      {
        id: "5",
        code: "1433",
        name: "Kairės pusės rankena",
        category: "Kairės pusės rankena",
        partType: "",
        carId: selectedCarId || "1",
        carBrand: "BMW",
        carModel: "320d",
        carYear: 2015,
        status: "In Stock",
        priceEUR: 25,
        pricePLN: 112.5,
        daysInInventory: 51,
        dateAdded: new Date(),
        photos: [],
        warehouse: "Sandėlys1",
        manufacturerCode: "1433",
      },
    ];

    const fakeOrders: Order[] = [
      {
        id: "1",
        date: new Date(),
        customerId: "1",
        customer: {
          id: "1",
          name: "Test Customer",
          email: "test@example.com",
          country: "Lithuania",
          isCompany: false,
        },
        status: "Delivered",
        items: [
          {
            partId: "1",
            partName: "Radijos antenos stiprintuvas",
            quantity: 32,
            priceEUR: 40,
            pricePLN: 180,
          },
          {
            partId: "4",
            partName: "Kairės pusės rankena",
            quantity: 11,
            priceEUR: 23,
            pricePLN: 103.5,
          },
        ],
        totalAmountEUR: 1633,
        totalAmountPLN: 7348.5,
        shippingCostEUR: 0,
        shippingCostPLN: 0,
        paymentMethod: "Card",
        shippingStatus: "Delivered",
      },
    ];

    return { fakeCategories, fakeParts, fakeOrders };
  }, [selectedCarId]); */

  const handleClearCarSelection = () => {
    dispatch(clearOrderControlSelectedCarId());
    setParts([]);
    setCategories([]);
    // Clear persisted state
    try {
      localStorage.removeItem(ORDER_CONTROL_STORAGE_KEY);
    } catch (error) {
      console.error("Error clearing persisted state:", error);
    }
  };

  // Function to fetch preorder analysis data for selected car
  const fetchPreorderAnalysis = async () => {
    // Prevent concurrent fetches
    if (fetchPreorderAnalysisInProgressRef.current) {
      return;
    }

    if (!selectedCarId) {
      setParts([]);
      setCategories([]);
      return;
    }

    fetchPreorderAnalysisInProgressRef.current = true;
    setIsLoadingParts(true);
    try {
      const selectedCar = cars.find((c) => c.id.toString() === selectedCarId);
      if (!selectedCar || !backendFilters) {
        setParts([]);
        setCategories([]);
        return;
      }

      // Map brand name to ID
      const brandId = mapBrandNameToId(selectedCar.brand, backendFilters);
      if (!brandId) {
        console.error("Could not find brand ID for:", selectedCar.brand);
        setParts([]);
        setCategories([]);
        return;
      }

      // Get fuel ID from car or filters
      let fuelId: number | undefined;
      const backendFiltersData = backendFilters as any;
      if (selectedCar.fuel?.id) {
        fuelId = selectedCar.fuel.id;
      } else if (orderFilters.fuelType && orderFilters.fuelType.length > 0) {
        // Try to map fuel type name to ID
        const fuelTypeName = orderFilters.fuelType[0];
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
              fuelId =
                typeof fuel === "string" ? undefined : fuel.id || fuel.rrr_id;
              break;
            }
          }
        }
      }

      // Build API parameters
      const params: {
        brand_id: number;
        model_id: number;
        year: number;
        fuel_id?: number;
        engine_volume?: string;
        date_from?: string;
        date_to?: string;
      } = {
        brand_id: brandId,
        model_id: selectedCar.model.id,
        year: selectedCar.year,
      };

      if (fuelId) {
        params.fuel_id = fuelId;
      }

      // Add engine volume if available
      if (selectedCar.engine?.capacity) {
        params.engine_volume = selectedCar.engine.capacity.toString();
      } else if (
        orderFilters.engineCapacity &&
        orderFilters.engineCapacity.length > 0
      ) {
        params.engine_volume = orderFilters.engineCapacity[0];
      }

      // Add date range if available from filters (for now, use default range)
      // You can add date filters to the UI later
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
      fetchPreorderAnalysisInProgressRef.current = false;
    }
  };

  // Restore data on mount - only restore filters and cars, don't auto-fetch or restore car selection
  useEffect(() => {
    const restoreData = async () => {
      // Prevent double execution in React Strict Mode
      if (restoreInProgressRef.current) {
        return;
      }

      // Only restore once, after restoration is complete and backend filters are loaded
      if (isRestoring || !backendFilters || hasRestored) {
        return;
      }

      // If we've already processed restoration, don't do it again
      if (hasFetchedCarsDuringRestoreRef.current) {
        return;
      }

      // Mark restoration as in progress
      restoreInProgressRef.current = true;

      try {
        // Filters are restored from localStorage in loadPersistedState
        // Cars are not persisted - user needs to click "Filtruoti" to fetch cars
        // Just mark as restored
        hasFetchedCarsDuringRestoreRef.current = true;
        setHasRestored(true);
      } catch (error) {
        console.error("Error during restore:", error);
      } finally {
        // Reset the ref - hasRestored flag will prevent future executions
        restoreInProgressRef.current = false;
      }
    };

    restoreData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRestoring, backendFilters, hasRestored, dispatch]);

  // Note: selectedCarId is not persisted, so no need to validate or set it on restore

  // Clear parts when car selection changes (to avoid showing stale data)
  useEffect(() => {
    if (!isRestoring) {
      // Clear parts whenever selection changes (including when cleared)
      setParts([]);
      setCategories([]);
    }
  }, [selectedCarId, isRestoring]);

  // Fetch parts when a car is selected (user action, not during restore)
  useEffect(() => {
    const fetchPartsForSelectedCar = async () => {
      // Only fetch if:
      // 1. Not restoring AND restoration is complete
      // 2. Not currently in the middle of restoration (check ref)
      // 3. Car is selected
      // 4. Cars are loaded
      // 5. Backend filters are loaded
      // 6. We haven't already fetched parts (to avoid duplicate calls)
      // 7. Not currently fetching (to prevent concurrent calls)
      if (
        isRestoring ||
        !hasRestored ||
        restoreInProgressRef.current ||
        !selectedCarId ||
        cars.length === 0 ||
        !backendFilters ||
        isLoadingParts ||
        fetchPreorderAnalysisInProgressRef.current
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
  }, [selectedCarId, cars.length, backendFilters, isRestoring, hasRestored]);

  const handleFilter = () => {
    // Fetch cars based on current filters, clearing any existing selection
    fetchCars(""); // Empty string means clear selection
  };

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
      const soldCount =
        part.analysisStatusCounts?.sold ??
        orders
          .filter((o) => o.status === "Delivered")
          .reduce((sum, o) => {
            const item = o.items.find((i) => i.partId === part.id);
            return sum + (item ? item.quantity : 0);
          }, 0);

      const statusText =
        part.status === "In Stock"
          ? "Sandėlyje"
          : part.status === "Reserved"
          ? "Rezervuota"
          : part.status === "Sold"
          ? "Parduota"
          : "Grąžinta";

      return [
        part.category || "-",
        part.name || "-",
        part.code || "-",
        part.manufacturerCode || "-",
        statusText,
        part.status === "In Stock" ? "1" : "0",
        soldCount.toString(),
        `${part.priceEUR} €`,
        part.warehouse || "-",
      ];
    });

    // Selected car info
    const selectedCar = cars.find((c) => c.id.toString() === selectedCarId);
    const carInfo = selectedCar
      ? `${selectedCar.brand} ${selectedCar.model.name} (${selectedCar.year})`
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

      <FilterPanel
        type="order-control"
        filters={orderFilters}
        onFiltersChange={(newFilters) => {
          setOrderFilters(newFilters as FilterState);
        }}
        cars={[]}
        onFilter={handleFilter}
        isLoading={isLoadingCars}
      />

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
                cars.length === 0 && !isLoadingCars
                  ? "Pirmiausia pasirinkite filtrus ir spustelėkite 'Filtruoti'"
                  : isLoadingCars
                  ? "Kraunami automobiliai..."
                  : "Pasirinkite automobilį"
              }
              disabled={cars.length === 0 || isLoadingCars}
            />
            {isLoadingCars && (
              <p className="text-xs text-muted-foreground mt-1">
                Kraunami automobiliai...
              </p>
            )}
            {!isLoadingCars && cars.length === 0 && (
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
                  orders={orders}
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
