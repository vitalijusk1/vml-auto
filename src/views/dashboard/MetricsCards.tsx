import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, TrendingUp, DollarSign, AlertCircle, Award } from 'lucide-react';
import { DashboardMetrics } from '@/types';

interface MetricsCardsProps {
  metrics: DashboardMetrics;
}

export function MetricsCards({ metrics }: MetricsCardsProps) {
  const cards = [
    {
      title: 'Total Parts in Stock',
      value: metrics.totalPartsInStock.toLocaleString(),
      icon: Package,
      color: 'text-metrics-primary-text',
      bgColor: 'bg-metrics-primary-bg/10',
    },
    {
      title: 'Total Parts Sold',
      value: metrics.totalPartsSold.toLocaleString(),
      icon: TrendingUp,
      color: 'text-metrics-secondary-text',
      bgColor: 'bg-metrics-secondary-bg/10',
    },
    {
      title: 'Total Parts (All Time)',
      value: metrics.totalPartsAllTime.toLocaleString(),
      icon: Package,
      color: 'text-metrics-tertiary-text',
      bgColor: 'bg-metrics-tertiary-bg/10',
    },
    {
      title: 'Revenue (Current Month)',
      value: `€${metrics.revenueCurrentMonth.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-metrics-revenue-text',
      bgColor: 'bg-metrics-revenue-bg/10',
    },
    {
      title: 'Top Selling Category',
      value: metrics.topSellingCategory,
      icon: Award,
      color: 'text-metrics-warning-text',
      bgColor: 'bg-metrics-warning-bg/10',
    },
    {
      title: 'Parts Older Than 6 Months',
      value: metrics.partsOlderThan6Months.toLocaleString(),
      icon: AlertCircle,
      color: 'text-metrics-danger-text',
      bgColor: 'bg-metrics-danger-bg/10',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <div className={`${card.bgColor} ${card.color} p-2 rounded-lg`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}




