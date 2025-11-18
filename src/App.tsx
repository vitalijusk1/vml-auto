import { useEffect } from "react";
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
import { DashboardView } from "./views/dashboard/DashboardView";

function App() {
  const dispatch = useAppDispatch();
  const currentView = useAppSelector(selectCurrentView);
  const backendFilters = useAppSelector(selectBackendFilters);

  // Fetch filters on app load if not already in Redux
  useEffect(() => {
    const fetchFilters = async () => {
      if (backendFilters === null) {
        try {
          const filtersData = await getFilters();
          dispatch(setBackendFilters(filtersData));
        } catch (error) {
          console.error("Error fetching filters on app load:", error);
        }
      }
    };

    fetchFilters();
  }, []);

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
