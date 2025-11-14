import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  RotateCcw,
  BarChart3,
  Menu,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCurrentView,
  selectMetrics,
  selectSidebarCollapsed,
} from "@/store/selectors";
import { setCurrentView, toggleSidebar } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Skydelis", icon: LayoutDashboard, view: "dashboard" as const },
  { name: "Sandėlys", icon: Package, view: "parts" as const },
  { name: "Užsakymai", icon: ShoppingCart, view: "orders" as const },
  { name: "Grąžinimai", icon: RotateCcw, view: "returns" as const },
  { name: "Analitika", icon: BarChart3, view: "analytics" as const },
];

export function Sidebar() {
  const dispatch = useAppDispatch();
  const currentView = useAppSelector(selectCurrentView);
  const metrics = useAppSelector(selectMetrics);
  const isCollapsed = useAppSelector(selectSidebarCollapsed);

  return (
    <div
      className={cn(
        "flex h-screen flex-col bg-card border-r transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div
        className={cn(
          "flex h-16 items-center border-b transition-all duration-300",
          isCollapsed ? "justify-center px-0" : "px-4"
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={() => dispatch(toggleSidebar())}
          className="h-9 w-9 flex-shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>
        {!isCollapsed && (
          <h1 className="text-xl font-bold ml-2 truncate min-w-0 flex-1">
            RRR Car Parts
          </h1>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.view;
          const showBadge =
            item.view === "parts" && metrics.partsOlderThan6Months > 0;
          return (
            <button
              key={item.name}
              onClick={() => dispatch(setCurrentView(item.view))}
              className={cn(
                "w-full flex items-center rounded-md text-sm font-medium transition-colors relative",
                isCollapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span>{item.name}</span>
                  {showBadge && (
                    <span className="ml-auto bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
                      {metrics.partsOlderThan6Months}
                    </span>
                  )}
                </>
              )}
              {isCollapsed && showBadge && (
                <span className="absolute -right-1 -top-1 h-3 w-3 bg-destructive rounded-full border-2 border-card" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
