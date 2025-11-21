import { CheckCircle2, BarChart3, Settings, AlertTriangle, LucideIcon } from "lucide-react";

export interface MetricData {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
}

interface Metrics {
  partsInStock: number;
  totalSold: number;
  totalPartsAllTime: number;
  earnings: number;
  activeOrders: number;
  partsNotSold3Months: number;
}

export function getMetricData(
  metrics: Metrics,
  currencyFormatter: (value: number) => string
): MetricData[] {
  return [
    {
      title: "Dalys sandėlyje",
      value: metrics.partsInStock,
      icon: CheckCircle2,
      iconColor: "text-green-500",
    },
    {
      title: "Iš viso parduota",
      value: metrics.totalSold,
      icon: BarChart3,
      iconColor: "text-muted-foreground",
    },
    {
      title: "Iš viso detalių (Per visa laiką)",
      value: metrics.totalPartsAllTime,
      icon: Settings,
      iconColor: "text-purple-500",
    },
    {
      title: "Uždarbis",
      value: currencyFormatter(metrics.earnings),
      icon: CheckCircle2,
      iconColor: "text-green-500",
    },
    {
      title: "Aktyvūs užsakymai",
      value: metrics.activeOrders,
      icon: CheckCircle2,
      iconColor: "text-green-500",
    },
    {
      title: "Dalys, kurios neparduotos per 3 mėn.",
      value: metrics.partsNotSold3Months,
      icon: AlertTriangle,
      iconColor: "text-red-500",
    },
  ];
}

