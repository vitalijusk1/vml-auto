import { LayoutDashboard, Package, Car, ShoppingCart, RotateCcw, BarChart3 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { selectCurrentView, selectMetrics } from '@/store/selectors';
import { setCurrentView } from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', icon: LayoutDashboard, view: 'dashboard' as const },
  { name: 'Parts', icon: Package, view: 'parts' as const },
  { name: 'Cars', icon: Car, view: 'cars' as const },
  { name: 'Orders', icon: ShoppingCart, view: 'orders' as const },
  { name: 'Returns', icon: RotateCcw, view: 'returns' as const },
  { name: 'Analytics', icon: BarChart3, view: 'analytics' as const },
];

export function Sidebar() {
  const dispatch = useAppDispatch();
  const currentView = useAppSelector(selectCurrentView);
  const metrics = useAppSelector(selectMetrics);

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-bold">RRR Car Parts</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          return (
            <button
              key={item.name}
              onClick={() => dispatch(setCurrentView(item.view))}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
              {item.view === 'parts' && metrics.partsOlderThan6Months > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                  {metrics.partsOlderThan6Months}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}




