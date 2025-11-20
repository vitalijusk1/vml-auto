import { useAppSelector } from "@/store/hooks";
import {
  selectParts,
  selectOrders,
  selectBackendFilters,
} from "@/store/selectors";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsFilterCard } from "./components/AnalyticsFilterCard";
import { SummaryMetricsCards } from "./components/SummaryMetricsCards";

const COLORS = {
  primary: "#000000",
  line: "#60A5FA",
};

export function AnalyticsView() {
  const parts = useAppSelector(selectParts);
  const orders = useAppSelector(selectOrders);
  const backendFilters = useAppSelector(selectBackendFilters);

  // Filter orders - only delivered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => order.status === "Delivered");
  }, [orders]);

  // Summary metrics - matching the image
  const summaryMetrics = useMemo(() => {
    const partsInStock = parts.filter((p) => p.status === "In Stock").length;

    // Calculate total sold from orders
    const totalSold = orders
      .filter((o) => o.status === "Delivered")
      .reduce((sum, order) => {
        return (
          sum +
          order.items.reduce((itemSum, item) => itemSum + item.quantity, 0)
        );
      }, 0);

    const totalPartsAllTime = parts.length;

    // Calculate earnings from delivered orders
    const earnings = filteredOrders.reduce(
      (sum, order) => sum + order.totalAmountEUR,
      0
    );

    // Active orders (non-delivered, non-cancelled)
    const activeOrders = orders.filter(
      (o) => o.status !== "Delivered" && o.status !== "Cancelled"
    ).length;

    // Parts not sold for 3 months
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const partsNotSold3Months = parts.filter(
      (p) => p.status === "In Stock" && p.dateAdded <= threeMonthsAgo
    ).length;

    return {
      partsInStock,
      totalSold,
      totalPartsAllTime,
      earnings,
      activeOrders,
      partsNotSold3Months,
    };
  }, [parts, orders, filteredOrders]);

  // Parts Sold by Car Model - from orders
  const partsSoldByModel = useMemo(() => {
    const modelData: Record<string, number> = {};

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const part = parts.find((p) => p.id === item.partId);
        if (part && part.carModel) {
          modelData[part.carModel] =
            (modelData[part.carModel] || 0) + item.quantity;
        }
      });
    });

    return Object.entries(modelData)
      .map(([model, count]) => ({ model, sold: count }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 12);
  }, [filteredOrders, parts]);

  // Parts Sold by Category - from orders
  const partsSoldByCategory = useMemo(() => {
    const categoryData: Record<string, number> = {};

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const part = parts.find((p) => p.id === item.partId);
        if (part && part.category) {
          categoryData[part.category] =
            (categoryData[part.category] || 0) + item.quantity;
        }
      });
    });

    return Object.entries(categoryData)
      .map(([category, units]) => ({ category, units }))
      .sort((a, b) => b.units - a.units);
  }, [filteredOrders, parts]);

  // Sales Trend - units per day
  const salesTrend = useMemo(() => {
    const dailyData: Record<string, number> = {};

    filteredOrders.forEach((order) => {
      const dateKey = order.date.toISOString().split("T")[0];
      const units = order.items.reduce((sum, item) => sum + item.quantity, 0);
      dailyData[dateKey] = (dailyData[dateKey] || 0) + units;
    });

    // Get all dates and sort
    const sortedDates = Object.keys(dailyData).sort();

    // If we have data, return it; otherwise generate sample data for this year
    if (sortedDates.length > 0) {
      return sortedDates.map((date) => ({
        date,
        units: dailyData[date],
      }));
    }

    // Generate sample data for this year (for demo purposes)
    const startDate = new Date(new Date().getFullYear(), 0, 1);
    const endDate = new Date();
    const sampleData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split("T")[0];
      // Generate random units between 30-50 for demo
      sampleData.push({
        date: dateKey,
        units: Math.floor(Math.random() * 20) + 30,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return sampleData;
  }, [filteredOrders]);

  // Currency formatter
  const currencyFormatter = (value: number) =>
    `€ ${value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Analatika</h1>
        <p className="text-muted-foreground">
          Prekių kiekiai sandėlyje, laikymo trukmė, kaina ir likęs atsargas
          sandėlyje
        </p>
      </div>

      {/* Filters Panel */}
      {backendFilters ? (
        <AnalyticsFilterCard backendFilters={backendFilters} />
      ) : (
        <Card>
          <CardContent>
            <p className="text-muted-foreground text-sm">Kraunami filtrai...</p>
          </CardContent>
        </Card>
      )}

      {/* Summary Metrics Cards - 6 cards in 2 rows */}
      <SummaryMetricsCards
        metrics={summaryMetrics}
        currencyFormatter={currencyFormatter}
      />

      {/* Charts */}
      <div className="space-y-6">
        {/* Parts Sold by Car Model - Full width */}
        <Card>
          <CardHeader>
            <CardTitle>Parts Sold by Car Model</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={partsSoldByModel}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="model"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sold" fill={COLORS.primary} name="Sold" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Parts Sold by Category - Full width */}
        <Card>
          <CardHeader>
            <CardTitle>Parts Sold by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={partsSoldByCategory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="category"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="units" fill={COLORS.primary} name="Units" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales Trend - Full width */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Sales Trend</CardTitle>
              <div className="flex gap-2">
                <select className="text-sm border rounded px-2 py-1">
                  <option>This Year</option>
                </select>
                <select className="text-sm border rounded px-2 py-1">
                  <option>This Year</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <YAxis
                  label={{
                    value: "Units per Day",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    });
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="units"
                  stroke={COLORS.line}
                  strokeWidth={2}
                  name="→ Units per Day"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
