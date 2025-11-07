import { MainLayout } from "./layout/MainLayout";
import { PartsView } from "./views/parts/PartsView";
import { CarsView } from "./views/cars/CarsView";
import { OrdersView } from "./views/orders/OrdersView";
import { ReturnsView } from "./views/returns/ReturnsView";
import { AnalyticsView } from "./views/analytics/AnalyticsView";
import { useAppSelector } from "./store/hooks";
import { selectCurrentView } from "./store/selectors";
import { DashboardView } from "./views/dashboard/DashboardView";

function App() {
  const currentView = useAppSelector(selectCurrentView);

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DashboardView />;
      case "parts":
        return <PartsView />;
      case "cars":
        return <CarsView />;
      case "orders":
        return <OrdersView />;
      case "returns":
        return <ReturnsView />;
      case "analytics":
        return <AnalyticsView />;
      default:
        return <DashboardView />;
    }
  };

  return <MainLayout>{renderView()}</MainLayout>;
}

export default App;
