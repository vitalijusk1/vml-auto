import { useState, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectParts, selectBackendFilters } from "@/store/selectors";
import { Table } from "../../components/tables/Table";
import { PageHeader } from "@/components/ui/PageHeader";
import { PartsFilterCard } from "./components/PartsFilterCard";
import { TopDetailsFilter } from "@/types";
import { useTablePagination } from "@/hooks/useTablePagination";

export function PartsView() {
  const parts = useAppSelector(selectParts);
  const backendFilters = useAppSelector(selectBackendFilters);
  const {
    pagination,
    handlePaginationUpdate,
    handlePageChange,
    handlePageSizeChange,
  } = useTablePagination();
  const [topDetailsFilter, setTopDetailsFilter] = useState<TopDetailsFilter>(
    TopDetailsFilter.NONE
  );

  // Handle top details filter change - wrapped in useCallback
  const handleTopDetailsFilterChange = useCallback(
    (value: TopDetailsFilter) => {
      setTopDetailsFilter(value);
    },
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sandėlys"
        description="Valdykite ir filtruokite sandėlio inventorių"
      />

      <PartsFilterCard
        onPaginationUpdate={handlePaginationUpdate}
        pagination={pagination}
        backendFilters={backendFilters}
        onTopDetailsFilterChange={handleTopDetailsFilterChange}
        topDetailsFilter={topDetailsFilter}
      />

      <Table
        type="parts"
        data={parts}
        serverPagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        topDetailsFilter={topDetailsFilter}
      />
    </div>
  );
}
