import { memo } from "react";
import { MetricCard } from "@/components/ui/MetricCard";
import { getMetricData } from "../data";

interface SummaryMetricsCardsProps {
  metrics: {
    partsInStock: number;
    totalSold: number;
    totalPartsAllTime: number;
    earnings: number;
    activeOrders: number;
    partsNotSold3Months: number;
  };
  currencyFormatter: (value: number) => string;
}

// Component for summary metrics cards - renders once on page load
export const SummaryMetricsCards = memo(function SummaryMetricsCards({
  metrics,
  currencyFormatter,
}: SummaryMetricsCardsProps) {
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
