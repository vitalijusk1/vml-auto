import { memo, useMemo } from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { getMetricData } from "../data";
import { useAppSelector } from "@/store/hooks";
import { selectAnalyticsOverviewData } from "@/store/selectors";

interface SummaryMetricsCardsProps {
  currencyFormatter: (value: number) => string;
}

// Component for summary metrics cards - renders once on page load
export const SummaryMetricsCards = memo(function SummaryMetricsCards({
  currencyFormatter,
}: SummaryMetricsCardsProps) {
  const overviewData = useAppSelector(selectAnalyticsOverviewData);

  const metrics = useMemo(() => {
    return {
      totalOrders: overviewData?.total_orders ?? 0,
      totalRevenue: overviewData?.total_revenue ?? 0,
      totalParts: overviewData?.total_parts ?? 0,
      totalCars: overviewData?.total_cars ?? 0,
      averageOrderValue: overviewData?.average_order_value ?? 0,
      recentOrdersCount: overviewData?.recent_orders_count ?? 0,
    };
  }, [overviewData]);

  const metricData = getMetricData(metrics, currencyFormatter);

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-3">
      {metricData.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          iconColor={metric.iconColor}
        />
      ))}
    </div>
  );
});
