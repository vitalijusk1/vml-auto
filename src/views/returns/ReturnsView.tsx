import { useState, useEffect, Fragment, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectReturns,
  selectBackendFilters,
  selectFilters,
} from "@/store/selectors";
import { FilterState } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { setReturns } from "@/store/slices/dataSlice";
import { setFilters } from "@/store/slices/filtersSlice";
import { getReturns } from "@/api/returns";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { Pagination } from "@/components/ui/Pagination";
import { TableToolbar } from "@/components/ui/TableToolbar";
import { getStatusBadgeClass } from "@/theme/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PhotoGallery } from "@/components/modals/components/PhotoGallery";

// Helper function to safely format dates
const formatReturnDate = (date: Date | string | null | undefined): string => {
  if (!date) return "N/A";
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "N/A";
    }
    return format(dateObj, "MMM dd, yyyy");
  } catch (error) {
    console.error("Error formatting date:", error, date);
    return "N/A";
  }
};

export function ReturnsView() {
  const dispatch = useAppDispatch();
  const returns = useAppSelector(selectReturns);
  const backendFilters = useAppSelector(selectBackendFilters);
  const filters = useAppSelector(selectFilters);
  const [expandedReturns, setExpandedReturns] = useState<Set<string>>(
    new Set()
  );
  const [isLoadingReturns, setIsLoadingReturns] = useState(false);
  const [tableFilter, setTableFilter] = useState("");
  const [selectedPhotoGallery, setSelectedPhotoGallery] = useState<{
    photos: string[];
    title: string;
  } | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  });

  // Serialize filters to detect changes properly (React does shallow comparison)
  const filtersKey = useMemo(() => {
    return JSON.stringify(filters);
  }, [filters]);

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  }, [filtersKey]);

  // Fetch returns when filters or pagination change
  useEffect(() => {
    const fetchData = async () => {
      // Wait for backendFilters to load before fetching with filters
      // This prevents calling the API with invalid parameters
      if (!backendFilters) {
        return;
      }

      setIsLoadingReturns(true);
      try {
        console.log("Fetching returns...");

        // Fetch returns
        // Note: API might not support pagination/filters yet, so we'll fetch all and paginate client-side
        const response = await getReturns();

        console.log("Returns response:", response);

        // getReturns returns Return[], so response is already an array
        const returnsArray = Array.isArray(response) ? response : [];

        dispatch(setReturns(returnsArray));

        // Pagination will be updated by the filteredReturns effect
      } catch (error) {
        console.error("Error fetching returns:", error);
        // Set empty array on error so table still shows
        dispatch(setReturns([]));
      } finally {
        setIsLoadingReturns(false);
      }
    };

    fetchData();
  }, [dispatch, filtersKey, backendFilters, pagination.per_page]);

  // Always expand all returns by default when returns change
  useEffect(() => {
    if (returns.length > 0) {
      setExpandedReturns(new Set(returns.map((r) => r.id)));
    }
  }, [returns]);

  const toggleReturnExpansion = (returnId: string) => {
    setExpandedReturns((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(returnId)) {
        newSet.delete(returnId);
      } else {
        newSet.add(returnId);
      }
      return newSet;
    });
  };

  // Client-side table filtering
  const filteredReturns = useMemo(() => {
    if (!tableFilter.trim()) {
      return returns;
    }
    const filterLower = tableFilter.toLowerCase();
    return returns.filter((returnItem) => {
      return (
        returnItem.id.toLowerCase().includes(filterLower) ||
        returnItem.orderId.toLowerCase().includes(filterLower) ||
        returnItem.customer?.name?.toLowerCase().includes(filterLower) ||
        returnItem.customer?.country?.toLowerCase().includes(filterLower) ||
        returnItem.items.some((item) =>
          item.partName.toLowerCase().includes(filterLower)
        )
      );
    });
  }, [returns, tableFilter]);

  // Update pagination total when filtered results change
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      current_page: 1, // Reset to first page when filter changes
      total: filteredReturns.length,
      last_page: Math.ceil(filteredReturns.length / prev.per_page) || 1,
    }));
  }, [filteredReturns.length]);

  // Apply client-side pagination
  const displayReturns = useMemo(() => {
    const startIndex = (pagination.current_page - 1) * pagination.per_page;
    const endIndex = startIndex + pagination.per_page;
    return filteredReturns.slice(startIndex, endIndex);
  }, [filteredReturns, pagination.current_page, pagination.per_page]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Grąžinimai</h1>
        <p className="text-muted-foreground">
          Valdykite ir filtruokite grąžinimus
        </p>
      </div>

      {backendFilters && (
        <FilterPanel
          type="parts"
          filters={filters}
          onFiltersChange={(newFilters) => {
            dispatch(setFilters(newFilters as FilterState));
          }}
          cars={[]}
          onFilter={() => {
            // Filter button is handled by the useEffect that watches filtersKey
          }}
          isLoading={isLoadingReturns}
          hideCategoriesAndWheels={true}
          hideTopDetailsFilter={true}
          showOrderIdFilter={false}
        />
      )}
      {!backendFilters && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Kraunami filtrai...
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <TableToolbar
            showing={displayReturns.length}
            total={pagination.total}
            itemName="grąžinimų"
            pagination={{
              pageIndex: pagination.current_page - 1,
              pageSize: pagination.per_page,
            }}
            onPageSizeChange={(pageSize) => {
              setPagination((prev) => ({
                ...prev,
                per_page: pageSize,
                current_page: 1,
              }));
            }}
            pageSizeOptions={[10, 15, 25, 50, 100]}
            filterValue={tableFilter}
            onFilterChange={setTableFilter}
            filterPlaceholder="Filtruoti grąžinimus..."
          />
        </CardHeader>
        <CardContent>
          {isLoadingReturns ? (
            <div className="text-center py-8 text-muted-foreground">
              Kraunami grąžinimai...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b-0">
                  <TableHead>Užsakymo Nr.</TableHead>
                  <TableHead>Grąžinimo Nr.</TableHead>
                  <TableHead>Grąžinimo sukūrimo data</TableHead>
                  <TableHead>Užsakovas</TableHead>
                  <TableHead>Šalis</TableHead>
                  <TableHead>Kiekis</TableHead>
                  <TableHead>Grąžintina suma</TableHead>
                  <TableHead>Grąžinimo statusas</TableHead>
                  <TableHead>Grąžinimo būsena</TableHead>
                  <TableHead>Sandėlys</TableHead>
                  <TableHead>Veiksmas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayReturns.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={11}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nėra grąžinimų
                    </TableCell>
                  </TableRow>
                ) : (
                  displayReturns.map((returnItem) => {
                    const isExpanded = expandedReturns.has(returnItem.id);
                    return (
                      <Fragment key={returnItem.id}>
                        <TableRow className="border-b-0">
                          <TableCell className="font-semibold">
                            {returnItem.itemOrderId ||
                              returnItem.orderId ||
                              "N/A"}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {returnItem.itemId || returnItem.id || "N/A"}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatReturnDate(returnItem.dateCreated)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-semibold">
                                {returnItem.customer?.name || "Unknown"}
                              </div>
                              {returnItem.customer?.isCompany && (
                                <div className="text-xs text-muted-foreground">
                                  {returnItem.customer.companyName}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {returnItem.customer?.country || "N/A"}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() =>
                                toggleReturnExpansion(returnItem.id)
                              }
                              className="flex items-center gap-2 hover:text-primary transition-colors font-semibold"
                            >
                              <span>{returnItem.items.length}</span>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">
                              €{(returnItem.returnAmount || 0).toLocaleString()}
                            </div>
                            {returnItem.refundableAmountPLN > 0 && (
                              <div className="text-xs text-muted-foreground">
                                PLN{" "}
                                {(
                                  returnItem.refundableAmountPLN || 0
                                ).toLocaleString()}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                "return",
                                returnItem.status || ""
                              )}`}
                            >
                              {returnItem.returnStatus || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {returnItem.refundStatus || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              N/A
                            </span>
                          </TableCell>
                          <TableCell>
                            {returnItem.creditNoteUrl ? (
                              <button
                                onClick={() => {
                                  window.open(
                                    returnItem.creditNoteUrl,
                                    "_blank"
                                  );
                                }}
                                className="flex items-center justify-center w-8 h-8 rounded hover:bg-muted transition-colors"
                                title="Peržiūrėti sąskaitą faktūrą"
                              >
                                <Eye className="h-4 w-4 text-primary" />
                              </button>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                -
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow
                            key={`${returnItem.id}-expanded`}
                            className="hover:bg-transparent"
                          >
                            <TableCell colSpan={11} className="p-0">
                              <div className="py-4">
                                <h4 className="font-semibold text-xs mb-3">
                                  Grąžinamos prekės ({returnItem.items.length})
                                </h4>
                                <div className="space-y-2">
                                  {returnItem.items.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start justify-between gap-4 p-3 bg-muted/30 rounded-lg border hover:bg-muted/30"
                                    >
                                      {item.photo && (
                                        <button
                                          onClick={() => {
                                            const photos =
                                              item.photoGallery ||
                                              (item.photo ? [item.photo] : []);
                                            if (photos.length > 0) {
                                              setSelectedPhotoGallery({
                                                photos,
                                                title:
                                                  item.partName || "Nuotraukos",
                                              });
                                            }
                                          }}
                                          className="w-16 h-16 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                        >
                                          <img
                                            src={item.photo}
                                            alt={item.partName}
                                            className="w-16 h-16 object-cover rounded"
                                          />
                                        </button>
                                      )}
                                      <div className="flex flex-col flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Prekė
                                        </div>
                                        <div className="text-sm font-semibold">
                                          {item.partName || "N/A"}
                                        </div>
                                      </div>
                                      <div className="flex flex-col flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Detalės id
                                        </div>
                                        <div className="text-sm">
                                          {item.partId || "N/A"}
                                        </div>
                                      </div>
                                      <div className="flex flex-col flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Gamintojo kodas
                                        </div>
                                        <div className="text-sm">
                                          {item.manufacturerCode ||
                                            item.partCode ||
                                            "N/A"}
                                        </div>
                                      </div>
                                      <div className="flex flex-col flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Automobilis
                                        </div>
                                        <div className="text-sm">
                                          {item.carBrand && item.carModel ? (
                                            <>
                                              <div>
                                                {item.carBrand} {item.carModel}
                                              </div>
                                              {item.carYear && (
                                                <div className="text-xs text-muted-foreground">
                                                  {item.carYear}
                                                </div>
                                              )}
                                            </>
                                          ) : (
                                            <div>N/A</div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex flex-col flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Kėbulo tipas
                                        </div>
                                        <div className="text-sm">
                                          {item.carBodyType || "N/A"}
                                        </div>
                                      </div>
                                      <div className="flex flex-col flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Kuro tipas
                                        </div>
                                        <div className="text-sm">
                                          {item.carFuelType || "N/A"}
                                        </div>
                                      </div>
                                      <div className="flex flex-col flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Variklio tūris
                                        </div>
                                        <div className="text-sm">
                                          {item.carEngineCapacity
                                            ? `${item.carEngineCapacity}L`
                                            : "N/A"}
                                        </div>
                                      </div>
                                      <div className="flex flex-col flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Priežastis
                                        </div>
                                        <div className="text-sm">
                                          {item.reason || "N/A"}
                                        </div>
                                      </div>
                                      <div className="flex flex-col flex-shrink-0 flex-1 text-right">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Kaina
                                        </div>
                                        <div className="text-sm">
                                          €{(item.price || 0).toLocaleString()}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
          {/* Pagination Controls */}
          {!isLoadingReturns && pagination.total > 0 && (
            <div className="flex items-center justify-end pt-4 border-t">
              <Pagination
                currentPage={pagination.current_page}
                totalPages={pagination.last_page}
                onPageChange={(page) => {
                  setPagination((prev) => ({
                    ...prev,
                    current_page: page,
                  }));
                }}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Gallery Modal */}
      <Dialog
        open={!!selectedPhotoGallery}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPhotoGallery(null);
          }
        }}
      >
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedPhotoGallery?.title || "Nuotraukos"}
            </DialogTitle>
          </DialogHeader>
          {selectedPhotoGallery && (
            <div className="mt-4">
              <PhotoGallery
                photos={selectedPhotoGallery.photos}
                title="Nuotraukos"
                altPrefix={`${selectedPhotoGallery.title} - Nuotrauka`}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
