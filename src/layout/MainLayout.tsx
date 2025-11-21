import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectSidebarCollapsed,
  selectBackendFilters,
} from "@/store/selectors";
import { setBackendFilters } from "@/store/slices/dataSlice";
import { getFilters } from "@/api/parts";
import { cn } from "@/lib/utils";

export function MainLayout() {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(selectSidebarCollapsed);
  const backendFilters = useAppSelector(selectBackendFilters);
  const filtersFetchedRef = useRef(false);

  // Fetch filters on layout mount if not already in Redux
  useEffect(() => {
    if (filtersFetchedRef.current) {
      return;
    }

    const fetchFilters = async () => {
      if (backendFilters === null && !filtersFetchedRef.current) {
        filtersFetchedRef.current = true;
        try {
          const filtersData = await getFilters();
          dispatch(setBackendFilters(filtersData));
        } catch (error) {
          console.error("Error fetching filters:", error);
          filtersFetchedRef.current = false; // Reset on error so it can retry
        }
      } else if (backendFilters !== null) {
        // Filters already loaded, mark as fetched
        filtersFetchedRef.current = true;
      }
    };

    fetchFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen overflow-y-hidden overflow-x-auto md:overflow-hidden">
      <Sidebar />
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden",
          !isSidebarCollapsed ? "md:min-w-0 min-w-[512px]" : "min-w-0"
        )}
      >
        <Header />
        <main
          className={cn(
            "flex-1 overflow-y-auto p-6",
            !isSidebarCollapsed ? "md:min-w-0 min-w-[512px]" : "min-w-0"
          )}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
