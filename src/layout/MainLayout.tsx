import { useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";
import { setBackendFilters } from "@/store/slices/dataSlice";
import { getFilters } from "@/api/parts";

export function MainLayout() {
  const dispatch = useAppDispatch();
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
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden w-full min-w-0">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
