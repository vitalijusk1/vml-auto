import { useAppSelector } from "@/store/hooks";
import { selectParts, selectOrders } from "@/store/selectors";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useMemo, useState } from "react";
import { AnalyticsFilters } from "./AnalyticsFilters";
import { FilterPanel } from "../../components/filters/FilterPanel";
import { DollarSign, Package, TrendingUp, TrendingDown } from "lucide-react";
import { theme } from "@/theme/theme";

const COLORS = [
  theme.colors.charts.primary,
  theme.colors.charts.secondary,
  theme.colors.charts.tertiary,
  theme.colors.charts.quaternary,
  theme.colors.charts.quinary,
  theme.colors.charts.senary,
];

const defaultFilters: AnalyticsFilters = {
  dateRange: {},
  timePeriod: "month",
  orderStatus: ["Delivered"],
  partStatus: ["Sold"],
  category: [],
  brand: [],
  metric: "revenue",
};

// Helper function to format date based on time period
function formatDateByPeriod(
  date: Date,
  period: "day" | "week" | "month" | "year"
): string {
  switch (period) {
    case "day":
      return date.toISOString().split("T")[0];
    case "week":
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      return `Week ${weekStart.toISOString().split("T")[0]}`;
    case "month":
      return date.toISOString().slice(0, 7);
    case "year":
      return date.getFullYear().toString();
    default:
      return date.toISOString().slice(0, 7);
  }
}

export function AnalyticsView() {
  const parts = useAppSelector(selectParts);
  const orders = useAppSelector(selectOrders);
  const [filters, setFilters] = useState<AnalyticsFilters>(defaultFilters);

  // Filter data based on analytics filters
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (!filters.orderStatus.includes(order.status)) return false;

      // Date range filter
      if (filters.dateRange.from && order.date < filters.dateRange.from)
        return false;
      if (filters.dateRange.to) {
        const toDate = new Date(filters.dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        if (order.date > toDate) return false;
      }

      return true;
    });
  }, [orders, filters]);

  const filteredParts = useMemo(() => {
    return parts.filter((part) => {
      // Status filter
      if (!filters.partStatus.includes(part.status)) return false;

      // Category filter
      if (
        filters.category.length > 0 &&
        !filters.category.includes(part.category)
      )
        return false;

      // Brand filter
      if (filters.brand.length > 0 && !filters.brand.includes(part.carBrand))
        return false;

      // Date range filter (for sold parts)
      if (part.dateSold) {
        if (filters.dateRange.from && part.dateSold < filters.dateRange.from)
          return false;
        if (filters.dateRange.to) {
          const toDate = new Date(filters.dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          if (part.dateSold > toDate) return false;
        }
      }

      return true;
    });
  }, [parts, filters]);

  // Summary metrics
  const summaryMetrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce(
      (sum, order) => sum + order.totalAmountEUR,
      0
    );
    const totalOrders = filteredOrders.length;
    const totalPartsSold = filteredParts.filter(
      (p) => p.status === "Sold"
    ).length;
    const totalPartsInStock = filteredParts.filter(
      (p) => p.status === "In Stock"
    ).length;

    // Calculate previous period for comparison
    const now = new Date();
    const currentPeriodStart = filters.dateRange.from || new Date(0);
    const currentPeriodEnd = filters.dateRange.to || now;

    const periodDuration =
      currentPeriodEnd.getTime() - currentPeriodStart.getTime();
    const previousPeriodStart = new Date(
      currentPeriodStart.getTime() - periodDuration
    );
    const previousPeriodEnd = currentPeriodStart;

    const previousRevenue = orders
      .filter((o) => {
        if (!filters.orderStatus.includes(o.status)) return false;
        return o.date >= previousPeriodStart && o.date < previousPeriodEnd;
      })
      .reduce((sum, order) => sum + order.totalAmountEUR, 0);

    const revenueChange =
      previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    return {
      totalRevenue,
      totalOrders,
      totalPartsSold,
      totalPartsInStock,
      revenueChange,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
    };
  }, [filteredOrders, filteredParts, filters, orders]);

  // Sales over time
  const salesOverTime = useMemo(() => {
    const salesByPeriod: Record<string, { revenue: number; count: number }> =
      {};

    filteredOrders.forEach((order) => {
      const periodKey = formatDateByPeriod(order.date, filters.timePeriod);
      if (!salesByPeriod[periodKey]) {
        salesByPeriod[periodKey] = { revenue: 0, count: 0 };
      }
      salesByPeriod[periodKey].revenue += order.totalAmountEUR;
      salesByPeriod[periodKey].count += 1;
    });

    return Object.entries(salesByPeriod)
      .map(([period, data]) => ({
        period,
        revenue: data.revenue,
        count: data.count,
        average: data.count > 0 ? data.revenue / data.count : 0,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }, [filteredOrders, filters.timePeriod]);

  const revenueByCategory = useMemo(() => {
    const categoryData: Record<string, { revenue: number; count: number }> = {};
    filteredParts
      .filter((p) => p.status === "Sold")
      .forEach((part) => {
        if (!categoryData[part.category]) {
          categoryData[part.category] = { revenue: 0, count: 0 };
        }
        categoryData[part.category].revenue += part.priceEUR;
        categoryData[part.category].count += 1;
      });
    return Object.entries(categoryData)
      .map(([category, data]) => ({
        category,
        revenue: data.revenue,
        count: data.count,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredParts]);

  const salesByBrand = useMemo(() => {
    const brandData: Record<string, { count: number; revenue: number }> = {};
    filteredParts
      .filter((p) => p.status === "Sold")
      .forEach((part) => {
        if (!brandData[part.carBrand]) {
          brandData[part.carBrand] = { count: 0, revenue: 0 };
        }
        brandData[part.carBrand].count += 1;
        brandData[part.carBrand].revenue += part.priceEUR;
      });
    return Object.entries(brandData)
      .map(([brand, data]) => ({
        brand,
        count: data.count,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [filteredParts]);

  const inventoryAgeDistribution = useMemo(() => {
    const ageRanges = {
      "0-3mo": 0,
      "3-6mo": 0,
      "6-12mo": 0,
      "12mo+": 0,
    };

    filteredParts
      .filter((p) => p.status === "In Stock")
      .forEach((part) => {
        const months = Math.floor(part.daysInInventory / 30);
        if (months < 3) ageRanges["0-3mo"]++;
        else if (months < 6) ageRanges["3-6mo"]++;
        else if (months < 12) ageRanges["6-12mo"]++;
        else ageRanges["12mo+"]++;
      });

    return Object.entries(ageRanges).map(([range, count]) => ({
      range,
      count,
    }));
  }, [filteredParts]);

  const partsByStatus = useMemo(() => {
    const statusCounts: Record<string, number> = {};
    filteredParts.forEach((part) => {
      statusCounts[part.status] = (statusCounts[part.status] || 0) + 1;
    });
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
    }));
  }, [filteredParts]);

  // Custom tooltip formatter
  const currencyFormatter = (value: number) =>
    `€${value.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}:{" "}
              {entry.dataKey === "revenue" || entry.dataKey === "average"
                ? currencyFormatter(entry.value)
                : entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Visualize your inventory and sales performance
        </p>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencyFormatter(summaryMetrics.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              {summaryMetrics.revenueChange !== 0 && (
                <>
                  {summaryMetrics.revenueChange > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  )}
                  <span
                    className={
                      summaryMetrics.revenueChange > 0
                        ? "text-green-500"
                        : "text-red-500"
                    }
                  >
                    {Math.abs(summaryMetrics.revenueChange).toFixed(1)}%
                  </span>
                  {" from previous period"}
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryMetrics.totalOrders.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg order: {currencyFormatter(summaryMetrics.averageOrderValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parts Sold</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryMetrics.totalPartsSold.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Sold parts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryMetrics.totalPartsInStock.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available parts
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        {/* Filters Panel */}
        <FilterPanel
          type="analytics"
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Charts */}
        <div>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={salesOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis
                      tickFormatter={(value) =>
                        filters.metric === "count"
                          ? value.toLocaleString()
                          : `€${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    {filters.metric === "revenue" ||
                    filters.metric === "both" ? (
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke={COLORS[0]}
                        strokeWidth={2}
                        name="Revenue (EUR)"
                      />
                    ) : null}
                    {filters.metric === "count" || filters.metric === "both" ? (
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke={COLORS[1]}
                        strokeWidth={2}
                        name="Order Count"
                      />
                    ) : null}
                    {filters.metric === "both" ? (
                      <Line
                        type="monotone"
                        dataKey="average"
                        stroke={COLORS[2]}
                        strokeWidth={2}
                        name="Avg Order Value"
                        strokeDasharray="5 5"
                      />
                    ) : null}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByCategory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `€${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="revenue"
                      fill={COLORS[0]}
                      name="Revenue (EUR)"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sales Distribution by Car Brand</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={salesByBrand}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(props: any) => {
                        const { brand, percent } = props;
                        return `${brand}: ${((percent as number) * 100).toFixed(
                          0
                        )}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {salesByBrand.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border rounded-lg shadow-lg p-3">
                              <p className="font-medium mb-2">{data.brand}</p>
                              <p className="text-sm">
                                Count: {data.count.toLocaleString()}
                              </p>
                              <p className="text-sm">
                                Revenue: {currencyFormatter(data.revenue)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Inventory Age Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={inventoryAgeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill={COLORS[3]} name="Parts Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parts by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={partsByStatus}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill={COLORS[4]} name="Parts Count" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
