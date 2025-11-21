import {
  Package,
  ShoppingCart,
  RotateCcw,
  BarChart3,
  Menu,
  ClipboardList,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSidebarCollapsed } from "@/store/selectors";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Sandėlys", icon: Package, path: "/parts" },
  { name: "Užsakymai", icon: ShoppingCart, path: "/orders" },
  { name: "Grąžinimai", icon: RotateCcw, path: "/returns" },
  { name: "Užsakymų valdymas", icon: ClipboardList, path: "/order-control" },
  { name: "Analitika", icon: BarChart3, path: "/analytics" },
];

export function Sidebar() {
  const dispatch = useAppDispatch();
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
            VML AUTO
          </h1>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "w-full flex items-center rounded-md text-sm font-medium transition-colors",
                  isCollapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
