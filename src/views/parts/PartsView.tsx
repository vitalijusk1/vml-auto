import { useState, useMemo, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";
import { Part } from "@/types";
import { Table } from "../../components/tables/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { PartsFilterCard } from "./components/PartsFilterCard";

export function PartsView() {
  const backendFilters = useAppSelector(selectBackendFilters);

  const [parts, setParts] = useState<Part[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  });
  const [topDetailsFilter, setTopDetailsFilter] = useState<string>("be-filtro");
  // Use empty array for cars since parts are fetched separately
  const cars: never[] = [];

  // Note: All filtering is handled by the backend
  // The parts returned from the API are already filtered based on the current filters
  const filteredParts = useMemo(() => {
    return parts;
  }, [parts]);

  // Callbacks for FilterPanelContainer to update parts and pagination
  const handlePartsUpdate = useCallback((newParts: Part[]) => {
    setParts(newParts);
  }, []);

  const handlePaginationUpdate = useCallback(
    (newPagination: {
      current_page: number;
      per_page: number;
      total: number;
      last_page: number;
    }) => {
      setPagination(newPagination);
    },
    []
  );

  // Handle top details filter change - wrapped in useCallback
  const handleTopDetailsFilterChange = useCallback((value: string) => {
    setTopDetailsFilter(value);
  }, []);

  // Table callbacks wrapped in useCallback to prevent unnecessary re-renders
  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      per_page: pageSize,
      current_page: 1,
    }));
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sandėlys"
        description="Valdykite ir filtruokite sandėlio inventorių"
      />

      <PartsFilterCard
        onPartsUpdate={handlePartsUpdate}
        onPaginationUpdate={handlePaginationUpdate}
        pagination={pagination}
        backendFilters={backendFilters}
        cars={cars}
        onTopDetailsFilterChange={handleTopDetailsFilterChange}
      />

      <Table
        type="parts"
        data={filteredParts}
        serverPagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        topDetailsFilter={topDetailsFilter}
      />
    </div>
  );
}
