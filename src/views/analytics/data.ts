import { CheckCircle2, BarChart3, Settings, AlertTriangle, TrendingUp, Package, LucideIcon } from "lucide-react";

export interface MetricData {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
}

interface Metrics {
  totalOrders: number;
  totalRevenue: number;
  totalParts: number;
  totalCars: number;
  averageOrderValue: number;
  recentOrdersCount: number;
}

export function getMetricData(
  metrics: Metrics,
  currencyFormatter: (value: number) => string
): MetricData[] {
  return [
    {
      title: "Iš viso užsakymų",
      value: metrics.totalOrders,
      icon: BarChart3,
      iconColor: "text-blue-500",
    },
    {
      title: "Bendras uždarbis",
      value: currencyFormatter(metrics.totalRevenue),
      icon: TrendingUp,
      iconColor: "text-green-500",
    },
    {
      title: "Iš viso dalių",
      value: metrics.totalParts,
      icon: Package,
      iconColor: "text-purple-500",
    },
    {
      title: "Iš viso automobilių",
      value: metrics.totalCars,
      icon: Settings,
      iconColor: "text-orange-500",
    },
    {
      title: "Vidutinė užsakymo vertė",
      value: currencyFormatter(metrics.averageOrderValue),
      icon: CheckCircle2,
      iconColor: "text-green-500",
    },
    {
      title: "Neseniai užsakyti",
      value: metrics.recentOrdersCount,
      icon: AlertTriangle,
      iconColor: "text-red-500",
    },
  ];
}

