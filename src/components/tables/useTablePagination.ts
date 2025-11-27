import { useState, useCallback } from "react";

export interface PaginationState {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export function useTablePagination(initialPerPage = 15) {
  const [pagination, setPagination] = useState<PaginationState>({
    current_page: 1,
    per_page: initialPerPage,
    total: 0,
    last_page: 1,
  });

  const handlePaginationUpdate = useCallback(
    (newPagination: PaginationState) => {
      setPagination(newPagination);
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setPagination((prev) => ({
      ...prev,
      current_page: page,
    }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      per_page: pageSize,
      current_page: 1,
    }));
  }, []);

  return {
    pagination,
    setPagination,
    handlePaginationUpdate,
    handlePageChange,
    handlePageSizeChange,
  };
}
