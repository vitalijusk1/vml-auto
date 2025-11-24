import {
  Package,
  ShoppingCart,
  RotateCcw,
  BarChart3,
  Menu,
  ClipboardList,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectSidebarCollapsed } from "@/store/selectors";
import { toggleSidebar } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

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
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-collapse sidebar on mobile - only on initial load
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      dispatch(toggleSidebar());
    }
  }, [isMobile]); // Remove isCollapsed and dispatch from dependencies to prevent re-triggering

  return (
    <>
      {/* Mobile overlay when sidebar is open */}
      {isMobile && !isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      <div
        className={cn(
          "flex h-screen flex-col bg-card border-r transition-all duration-300 z-50",
          // Mobile: full overlay when open, hidden when collapsed
          isMobile
            ? isCollapsed
              ? "fixed -translate-x-full w-64"
              : "fixed inset-y-0 left-0 w-64"
            : // Desktop: normal behavior
            isCollapsed
            ? "w-16"
            : "w-64"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b transition-all duration-300",
            isCollapsed && !isMobile ? "justify-center px-0" : "px-4"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            className="h-9 w-9 flex-shrink-0"
          >
            {isMobile && !isCollapsed ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
          {(!isCollapsed || isMobile) && (
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
                onClick={() => {
                  // Auto-close sidebar on mobile after navigation
                  if (isMobile && !isCollapsed) {
                    dispatch(toggleSidebar());
                  }
                }}
                className={({ isActive }) =>
                  cn(
                    "w-full flex items-center rounded-md text-sm font-medium transition-colors",
                    isCollapsed && !isMobile
                      ? "justify-center px-2 py-2"
                      : "gap-3 px-3 py-2",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )
                }
                title={isCollapsed && !isMobile ? item.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {(!isCollapsed || isMobile) && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </>
  );
}
