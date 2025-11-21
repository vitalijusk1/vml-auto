import { Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "./layout/MainLayout";
import { PartsView } from "./views/parts/PartsView";
import { OrdersView } from "./views/orders/OrdersView";
import { ReturnsView } from "./views/returns/ReturnsView";
import { AnalyticsView } from "./views/analytics/AnalyticsView";
import { OrderControlView } from "./views/order-control/OrderControlView";
import { LoginView } from "./views/login/LoginView";

function App() {
  return (
    <Routes>
      {/* Login route - no MainLayout */}
      <Route path="/login" element={<LoginView />} />
      {/* Protected routes with MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/parts" replace />} />
        <Route path="parts" element={<PartsView />} />
        <Route path="orders" element={<OrdersView />} />
        <Route path="returns" element={<ReturnsView />} />
        <Route path="order-control" element={<OrderControlView />} />
        <Route path="analytics" element={<AnalyticsView />} />
        {/* Catch all - redirect to parts */}
        <Route path="*" element={<Navigate to="/parts" replace />} />
      </Route>
    </Routes>
  );
}

export default App;
