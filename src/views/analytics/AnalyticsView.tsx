import { useAppSelector } from "@/store/hooks";
import {
  selectOrders,
  selectBackendFilters,
  selectAnalyticsPartsData,
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
  const orders = useAppSelector(selectOrders);

  const partsData = useAppSelector(selectAnalyticsPartsData);

  // Filter orders - only delivered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => order.status === "Delivered");
  }, [orders]);

  // Parts Sold by Car Model - from API
  const partsSoldByModel = useMemo(() => {
    //Use by model when its available for we're using by positions as a placeholder
    if (
      partsData?.parts_by_position &&
      partsData.parts_by_position.length > 0
    ) {
      return partsData.parts_by_position
        .map((item) => ({ model: item.position, sold: item.value }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 12);
    }

    // Fallback to empty array if no API data
    return [];
  }, [partsData]);

  // Parts Sold by Category - from API
  const partsSoldByCategory = useMemo(() => {
    if (
      partsData?.parts_by_category &&
      partsData.parts_by_category.length > 0
    ) {
      return partsData.parts_by_category
        .map((item) => ({ category: item.name, units: item.value }))
        .sort((a, b) => b.units - a.units);
    }

    // Fallback to empty array if no API data
    return [];
  }, [partsData]);

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
      <AnalyticsFilterCard />

      {/* Summary Metrics Cards - 6 cards in 2 rows */}
      <SummaryMetricsCards currencyFormatter={currencyFormatter} />

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
