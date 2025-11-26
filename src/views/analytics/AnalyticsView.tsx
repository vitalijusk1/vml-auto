import { useAppSelector } from "@/store/hooks";
import {
  selectOrders,
  selectAnalyticsPartsData,
  selectFilters,
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
import { useMemo, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsFilterCard } from "./components/AnalyticsFilterCard";
import { SummaryMetricsCards } from "./components/SummaryMetricsCards";
import { formatDateChartLithuanian } from "@/utils/dateFormatting";
import {
  getStatisticsOrders,
  StatisticsOrdersData,
  filterStateToStatisticsQueryParams,
} from "@/api/statistics";

const COLORS = {
  primary: "#000000",
  line: "#60A5FA",
};

export function AnalyticsView() {
  const orders = useAppSelector(selectOrders);
  const filters = useAppSelector(selectFilters);

  const partsData = useAppSelector(selectAnalyticsPartsData);
  const [ordersData, setOrdersData] = useState<StatisticsOrdersData | null>(
    null
  );
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("month");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  // Fetch statistics orders data
  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const queryParams = filterStateToStatisticsQueryParams(filters);
        const data = await getStatisticsOrders({
          ...queryParams,
          group_by: groupBy,
          ...(dateFrom ? { date_from: dateFrom } : {}),
          ...(dateTo ? { date_to: dateTo } : {}),
        });
        setOrdersData(data);
      } catch (error) {
        console.error("Failed to fetch statistics orders:", error);
      }
    };

    fetchOrdersData();
  }, [filters, groupBy, dateFrom, dateTo]);

  // Filter orders - only delivered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => order.status === "DELIVERED");
  }, [orders]);

  // Parts Sold by Car Model - from API
  const partsSoldByModel = useMemo(() => {
    if (partsData?.parts_by_brand && partsData.parts_by_brand.length > 0) {
      return partsData.parts_by_brand
        .map((item) => ({ model: item.name, sold: item.value }))
        .sort((a, b) => b.sold - a.sold)
        .slice(0, 12);
    }

    // Fallback to position if brand not available (legacy placeholder)
    if (
      partsData?.parts_by_position &&
      partsData.parts_by_position.length > 0
    ) {
      return partsData.parts_by_position
        .map((item) => ({ model: item.name, sold: item.value }))
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

  // Sales Trend - using API data if available, otherwise fallback
  const salesTrend = useMemo(() => {
    // Use API data if available
    if (ordersData?.daily_stats && ordersData.daily_stats.length > 0) {
      return ordersData.daily_stats.map((stat) => ({
        date: stat.name,
        units: stat.orders_count,
        revenue: stat.revenue,
        profit: stat.profit,
      }));
    }

    // Legacy fallback logic
    const dailyData: Record<string, number> = {};

    filteredOrders.forEach((order) => {
      const dateKey = new Date(order.date).toISOString().split("T")[0];
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
  }, [filteredOrders, ordersData]);

  // Currency formatter
  const currencyFormatter = (value: number) =>
    `€ ${value.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;

  const formatAxisDate = (value: string) => {
    if (!value) return "";

    if (groupBy === "day") {
      return formatDateChartLithuanian(value);
    }

    if (groupBy === "week") {
      // value is "2025-43"
      const parts = value.split("-");
      if (parts.length === 2) {
        return `${parts[1]} sav.`;
      }
      return value;
    }

    if (groupBy === "month") {
      // value is "2025-11"
      const parts = value.split("-");
      if (parts.length === 2) {
        const monthIndex = parseInt(parts[1], 10) - 1;
        const monthName = [
          "Sau",
          "Vas",
          "Kov",
          "Bal",
          "Geg",
          "Bir",
          "Lie",
          "Rugp",
          "Rugs",
          "Spa",
          "Lap",
          "Gru",
        ][monthIndex];
        // Show year only if it changes or distinct
        return `${monthName}`;
      }
      return value;
    }

    return value;
  };

  const formatTooltipDate = (value: string) => {
    if (!value) return "";

    if (groupBy === "day") {
      const date = new Date(value);
      return date.toLocaleDateString("lt-LT");
    }

    if (groupBy === "week") {
      const parts = value.split("-");
      if (parts.length === 2) {
        return `${parts[0]} m. ${parts[1]} savaitė`;
      }
      return value;
    }

    if (groupBy === "month") {
      const parts = value.split("-");
      if (parts.length === 2) {
        const monthIndex = parseInt(parts[1], 10) - 1;
        const monthNames = [
          "Sausis",
          "Vasaris",
          "Kovas",
          "Balandis",
          "Gegužė",
          "Birželis",
          "Liepa",
          "Rugpjūtis",
          "Rugsėjis",
          "Spalis",
          "Lapkritis",
          "Gruodis",
        ];
        return `${parts[0]} m. ${monthNames[monthIndex]}`;
      }
      return value;
    }

    return value;
  };

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
            <CardTitle>Detales pagal gamintoja</CardTitle>
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
                <Bar dataKey="sold" fill={COLORS.primary} name="Parduota" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Parts Sold by Category - Full width */}
        <Card>
          <CardHeader>
            <CardTitle>Detales parduotos pagal kategorija</CardTitle>
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
                <Bar dataKey="units" fill={COLORS.primary} name="Kiekis" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sales Trend - Full width */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pardavimų tendencija</CardTitle>
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  className="text-sm border rounded px-2 py-1"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  placeholder="From"
                />
                <span className="text-sm text-muted-foreground">-</span>
                <input
                  type="date"
                  className="text-sm border rounded px-2 py-1"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  placeholder="To"
                />
                <div className="w-px h-4 bg-border mx-2" />
                <select
                  className="text-sm border rounded px-2 py-1"
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value as any)}
                >
                  <option value="day">Diena</option>
                  <option value="week">Savaitė</option>
                  <option value="month">Mėnuo</option>
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={formatAxisDate} />
                <YAxis
                  label={{
                    value: "Užsakymai",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip labelFormatter={formatTooltipDate} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="units"
                  stroke={COLORS.line}
                  strokeWidth={2}
                  name="Užsakymai"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
