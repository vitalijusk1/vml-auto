import { useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardView } from './components/dashboard/DashboardView';
import { PartsView } from './components/parts/PartsView';
import { CarsView } from './components/cars/CarsView';
import { OrdersView } from './components/orders/OrdersView';
import { ReturnsView } from './components/returns/ReturnsView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { selectCurrentView, selectInitialized } from './store/selectors';
import { initializeData } from './store/slices/dataSlice';

function App() {
  const dispatch = useAppDispatch();
  const currentView = useAppSelector(selectCurrentView);
  const initialized = useAppSelector(selectInitialized);

  // Initialize data once on app load
  useEffect(() => {
    if (!initialized) {
      dispatch(initializeData());
    }
  }, [dispatch, initialized]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'parts':
        return <PartsView />;
      case 'cars':
        return <CarsView />;
      case 'orders':
        return <OrdersView />;
      case 'returns':
        return <ReturnsView />;
      case 'analytics':
        return <AnalyticsView />;
      default:
        return <DashboardView />;
    }
  };

  return <MainLayout>{renderView()}</MainLayout>;
}

export default App;
