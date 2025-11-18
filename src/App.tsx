import { useEffect, useRef } from "react";
import { MainLayout } from "./layout/MainLayout";
import { PartsView } from "./views/parts/PartsView";
import { OrdersView } from "./views/orders/OrdersView";
import { ReturnsView } from "./views/returns/ReturnsView";
import { AnalyticsView } from "./views/analytics/AnalyticsView";
import { OrderControlView } from "./views/order-control/OrderControlView";
import { useAppSelector, useAppDispatch } from "./store/hooks";
import { selectCurrentView, selectBackendFilters } from "./store/selectors";
import { setBackendFilters } from "./store/slices/dataSlice";
import { getFilters } from "./api/parts";

function App() {
  const dispatch = useAppDispatch();
  const currentView = useAppSelector(selectCurrentView);
  const backendFilters = useAppSelector(selectBackendFilters);
  const filtersFetchedRef = useRef(false);

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

  const renderView = () => {
    switch (currentView) {
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
        return <PartsView />;
    }
  };

  return <MainLayout>{renderView()}</MainLayout>;
}

export default App;
