import { useEffect, useRef } from "react";
import { MainLayout } from "./layout/MainLayout";
import { PartsView } from "./views/parts/PartsView";
import { OrdersView } from "./views/orders/OrdersView";
import { ReturnsView } from "./views/returns/ReturnsView";
import { AnalyticsView } from "./views/analytics/AnalyticsView";
import { OrderControlView } from "./views/order-control/OrderControlView";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import {
  selectCurrentView,
  selectBackendFilters,
  selectCars,
} from "./store/selectors";
import { setBackendFilters, setCars } from "./store/slices/dataSlice";
import { getFilters } from "./api/parts";
import { getCars } from "./api/cars";
import { DashboardView } from "./views/dashboard/DashboardView";

function App() {
  const dispatch = useAppDispatch();
  const currentView = useAppSelector(selectCurrentView);
  const backendFilters = useAppSelector(selectBackendFilters);
  const cars = useAppSelector(selectCars);
  const filtersFetchedRef = useRef(false);
  const carsFetchedRef = useRef(false);

  // Fetch filters on app load if not already in Redux
  // Only fetch once on initial mount, not on every render or navigation
  useEffect(() => {
    // Prevent multiple fetches even if component remounts
    if (filtersFetchedRef.current) {
      return;
    }

    const fetchFilters = async () => {
      if (backendFilters === null && !filtersFetchedRef.current) {
        filtersFetchedRef.current = true;
        try {
          const filtersData = await getFilters();
          dispatch(setBackendFilters(filtersData));
        } catch (error) {
          console.error("Error fetching filters on app load:", error);
          filtersFetchedRef.current = false; // Reset on error so it can retry
        }
      } else if (backendFilters !== null) {
        // Filters already loaded, mark as fetched
        filtersFetchedRef.current = true;
      }
    };

    fetchFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array ensures this only runs once on mount

  // Fetch all cars on app load if not already in Redux
  useEffect(() => {
    // Prevent multiple fetches even if component remounts
    if (carsFetchedRef.current) {
      return;
    }

    const fetchAllCars = async () => {
      if (cars.length === 0 && !carsFetchedRef.current) {
        carsFetchedRef.current = true;
        try {
          // Fetch all cars with a high per_page limit
          const response = await getCars({ page: 1, per_page: 10000 });
          dispatch(setCars(response.cars));
        } catch (error) {
          console.error("Error fetching cars on app load:", error);
          carsFetchedRef.current = false; // Reset on error so it can retry
        }
      } else if (cars.length > 0) {
        // Cars already loaded, mark as fetched
        carsFetchedRef.current = true;
      }
    };

    fetchAllCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty array ensures this only runs once on mount

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView />;
      case "parts":
        return <PartsView />;
      case "orders":
        return <OrdersView />;
      case "returns":
        return <ReturnsView />;
      case "order-control":
        return <OrderControlView />;
      case "analytics":
        return <AnalyticsView />;
      default:
        return <DashboardView />;
    }
  };

  return <MainLayout>{renderView()}</MainLayout>;
}

export default App;
