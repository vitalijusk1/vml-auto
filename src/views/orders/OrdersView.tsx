import { useState, useEffect, Fragment, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  selectOrders,
  selectBackendFilters,
  selectCars,
  selectFilters,
} from "@/store/selectors";
import { OrderStatus, FilterState } from "@/types";
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
import { ChevronDown, ChevronUp } from "lucide-react";
import { setOrders } from "@/store/slices/dataSlice";
import { setFilters } from "@/store/slices/filtersSlice";
import { getOrders, filterStateToOrdersQueryParams } from "@/api/orders";
import { FilterPanel } from "@/components/filters/FilterPanel";
import { getStatusBadgeClass } from "@/theme/utils";
import { Pagination } from "@/components/ui/Pagination";
import { TableToolbar } from "@/components/ui/TableToolbar";

// Get status badge class for order statuses
const getOrderStatusClass = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, string> = {
    Pending: getStatusBadgeClass("order", "Pending"),
    Processing: getStatusBadgeClass("order", "Processing"),
    Shipped: getStatusBadgeClass("order", "Shipped"),
    Delivered: getStatusBadgeClass("order", "Delivered"),
    Cancelled: getStatusBadgeClass("order", "Cancelled"),
  };
  return statusMap[status] || getStatusBadgeClass("order", "Pending");
};

// Translate order status to Lithuanian
const getOrderStatusLabel = (status: OrderStatus): string => {
  const statusLabels: Record<OrderStatus, string> = {
    Pending: "Laukiama",
    Processing: "Ruošiama",
    Shipped: "Išsiųsta",
    Delivered: "Pristatyta",
    Cancelled: "Atšaukta",
  };
  return statusLabels[status] || status;
};

// Helper function to safely format dates
const formatOrderDate = (date: Date | string | null | undefined): string => {
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

export function OrdersView() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const backendFilters = useAppSelector(selectBackendFilters);
  const cars = useAppSelector(selectCars);
  const filters = useAppSelector(selectFilters);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [tableFilter, setTableFilter] = useState("");
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 15,
    total: 0,
    last_page: 1,
  });

  // Enrich orders with car details from Redux
  const enrichedOrders = useMemo(() => {
    return orders.map((order) => ({
      ...order,
      items: order.items.map((item) => {
        // Find car by ID (carId might be string or number)
        const car = item.carId
          ? cars.find(
              (c) =>
                c.id === Number(item.carId) ||
                String(c.id) === String(item.carId)
            )
          : null;

        return {
          ...item,
          // Car details from car lookup
          ...(car && {
            carBrand: car.brand,
            carModel: car.model.name,
            carYear: car.year,
            bodyType: car.body_type?.name,
            engineCapacity: car.engine.capacity,
            fuelType: car.fuel?.name,
          }),
          // Manufacturer code comes directly from the API response (mapped in transformOrder)
        };
      }),
    }));
  }, [orders, cars]);

  // Note: Filters are fetched in App.tsx on initial load, no need to fetch here

  // Serialize filters to detect changes properly (React does shallow comparison)
  const filtersKey = useMemo(() => {
    return JSON.stringify(filters);
  }, [filters]);

  // Reset pagination to page 1 when filters change
  useEffect(() => {
    setPagination((prev) => ({ ...prev, current_page: 1 }));
  }, [filtersKey]);

  // Fetch orders when filters or pagination change
  useEffect(() => {
    const fetchData = async () => {
      // Wait for backendFilters to load before fetching with filters
      // This prevents calling the API with invalid parameters
      if (!backendFilters) {
        return;
      }

      setIsLoadingOrders(true);
      try {
        // Convert filters to query parameters
        const queryParams = filterStateToOrdersQueryParams(
          filters,
          backendFilters
        );

        // Always add pagination parameters
        queryParams.page = pagination.current_page || 1;
        queryParams.per_page = pagination.per_page || 15;

        console.log("Fetching orders with params:", queryParams);

        // Fetch orders with filters and pagination
        const response = await getOrders(queryParams);

        console.log("Orders response:", response);
        dispatch(setOrders(response.orders));
        setPagination(response.pagination);
      } catch (error) {
        console.error("Error fetching orders:", error);
        // Set empty array on error so table still shows
        dispatch(setOrders([]));
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchData();
  }, [
    dispatch,
    filtersKey,
    backendFilters,
    pagination.current_page,
    pagination.per_page,
  ]);

  // Always expand all orders by default when orders change
  useEffect(() => {
    if (enrichedOrders.length > 0) {
      setExpandedOrders(new Set(enrichedOrders.map((o) => o.id)));
    }
  }, [enrichedOrders]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  // Client-side table filtering
  const displayOrders = useMemo(() => {
    if (!tableFilter.trim()) {
      return enrichedOrders;
    }
    const filterLower = tableFilter.toLowerCase();
    return enrichedOrders.filter((order) => {
      return (
        order.id.toLowerCase().includes(filterLower) ||
        order.customer?.name?.toLowerCase().includes(filterLower) ||
        order.customer?.country?.toLowerCase().includes(filterLower) ||
        order.items.some((item) =>
          item.partName.toLowerCase().includes(filterLower)
        )
      );
    });
  }, [enrichedOrders, tableFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Užsakymai</h1>
        <p className="text-muted-foreground">
          Valdykite ir filtruokite užsakymus
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
          isLoading={isLoadingOrders}
          hideCategoriesAndWheels={true}
          hideTopDetailsFilter={true}
          showOrderIdFilter={true}
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
            showing={displayOrders.length}
            total={pagination.total}
            itemName="užsakymų"
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
            filterPlaceholder="Filtruoti užsakymus..."
          />
        </CardHeader>
        <CardContent>
          {isLoadingOrders ? (
            <div className="text-center py-8 text-muted-foreground">
              Kraunami užsakymai...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b-0">
                  <TableHead>Užsakymo Nr.</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Užsakovas</TableHead>
                  <TableHead>Šalis</TableHead>
                  <TableHead>Kiekis</TableHead>
                  <TableHead>Sumokėta</TableHead>
                  <TableHead>Pristatymas</TableHead>
                  <TableHead>Statusas</TableHead>
                  <TableHead>Sandėlys</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayOrders.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nėra užsakymų
                    </TableCell>
                  </TableRow>
                ) : (
                  displayOrders.map((order) => {
                    const isExpanded = expandedOrders.has(order.id);
                    return (
                      <Fragment key={order.id}>
                        <TableRow className="border-b-0">
                          <TableCell className="font-semibold">
                            {order.id}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatOrderDate(order.date)}
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-semibold">
                                {order.customer?.name || "Unknown"}
                              </div>
                              {order.customer?.isCompany && (
                                <div className="text-xs text-muted-foreground">
                                  {order.customer.companyName}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold">
                            {order.customer?.country || "N/A"}
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => toggleOrderExpansion(order.id)}
                              className="flex items-center gap-2 hover:text-primary transition-colors font-semibold"
                            >
                              <span>{order.items.length}</span>
                              {isExpanded ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">
                              €{(order.totalAmountEUR || 0).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-semibold">
                              €{(order.shippingCostEUR || 0).toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusClass(
                                order.status
                              )}`}
                            >
                              {getOrderStatusLabel(order.status)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              N/A
                            </span>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow
                            key={`${order.id}-expanded`}
                            className="hover:bg-transparent"
                          >
                            <TableCell colSpan={9} className="p-0">
                              <div className="py-4">
                                <h4 className="font-semibold text-xs mb-3">
                                  Užsakytos prekės ({order.items.length})
                                </h4>
                                <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start justify-between gap-4 p-3 bg-muted/30 rounded-lg border hover:bg-muted/30"
                                    >
                                      {item.photo && (
                                        <img
                                          src={item.photo}
                                          alt={item.partName}
                                          className="w-16 h-16 object-cover rounded flex-shrink-0"
                                        />
                                      )}
                                      <div className="flex flex-col flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Pavadinimas
                                        </div>
                                        <div className="text-sm">
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
                                          {item.bodyType || "N/A"}
                                        </div>
                                      </div>
                                      <div className="flex flex-col flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Variklio tūris
                                        </div>
                                        <div className="text-sm">
                                          {item.engineCapacity
                                            ? `${item.engineCapacity}cc`
                                            : "N/A"}
                                        </div>
                                      </div>
                                      <div className="flex flex-col flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Kuro tipas
                                        </div>
                                        <div className="text-sm">
                                          {item.fuelType || "N/A"}
                                        </div>
                                      </div>
                                      <div className="flex flex-col flex-1">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Gamintojo kodas
                                        </div>
                                        <div className="text-sm">
                                          {item.manufacturerCode || "N/A"}
                                        </div>
                                      </div>
                                      <div className="flex flex-col flex-shrink-0 flex-1 text-right">
                                        <div className="text-xs text-muted-foreground mb-1">
                                          Kaina
                                        </div>
                                        <div className="text-sm">
                                          €
                                          {(
                                            item.priceEUR || 0
                                          ).toLocaleString()}
                                        </div>
                                        {item.quantity > 1 && (
                                          <>
                                            <div className="text-xs text-muted-foreground mt-1">
                                              Kiekis
                                            </div>
                                            <div className="text-sm">
                                              {item.quantity}
                                            </div>
                                          </>
                                        )}
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
          {!isLoadingOrders && pagination.total > 0 && (
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
    </div>
  );
}
