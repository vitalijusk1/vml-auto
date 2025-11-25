import { Fragment } from "react";
import {
  Car,
  Part,
  Order,
  Return,
  PartStatus,
  OrderStatus,
  ReturnStatus,
} from "@/types";
import { LayoutType } from "../filters/type";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PhotoTableCell } from "@/components/ui/PhotoTableCell";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateLithuanian } from "@/utils/dateFormatting";
import { getStatusBadgeClass } from "@/theme/utils";
import { useAppSelector } from "@/store/hooks";
import { selectBackendFilters } from "@/store/selectors";
import { getLocalizedText } from "@/utils/i18n";

interface MobileTableViewProps<T extends Car | Part | Order | Return> {
  type: Exclude<LayoutType, "analytics" | "order-control">;
  data: T[];
  expandedRows?: Set<string>;
  onToggleExpand?: (id: string) => void;
  renderExpandedRow?: (item: T) => React.ReactNode;
  onItemClick?: (item: T) => void;
}

export function MobileTableView<T extends Car | Part | Order | Return>({
  type,
  data,
  expandedRows,
  onToggleExpand,
  renderExpandedRow,
  onItemClick,
}: MobileTableViewProps<T>) {
  const backendFilters = useAppSelector(selectBackendFilters);

  // Helper to find status from backend filters by matching English name
  const findStatusFromBackend = (
    status: PartStatus,
    backendFilters: any
  ): string | null => {
    const statuses = backendFilters?.parts?.statuses;
    if (!Array.isArray(statuses)) return null;

    // Map English status to Lithuanian names
    const lithuanianNameMap: Record<PartStatus, string> = {
      "In Stock": "Sandėlyje",
      Reserved: "Rezervuota",
      Sold: "Parduota",
      Returned: "Grąžinta",
    };
    const lithuanianName = lithuanianNameMap[status];

    for (const statusOption of statuses) {
      if (typeof statusOption === "string") {
        if (statusOption === lithuanianName) {
          return statusOption;
        }
      } else if (statusOption && typeof statusOption === "object") {
        const ltName = statusOption.languages?.lt;
        const enName = statusOption.languages?.en;

        if (ltName === lithuanianName || enName === status) {
          return getLocalizedText(statusOption.languages, statusOption.name);
        }
      }
    }
    return null;
  };

  const getStatusLabel = (status: PartStatus): string => {
    // Try to get from backend filters first (with language support)
    const backendStatus = findStatusFromBackend(status, backendFilters);
    if (backendStatus) return backendStatus;

    // Fallback to hardcoded Lithuanian translations
    const statusLabels: Record<PartStatus, string> = {
      "In Stock": "Sandėlyje",
      Reserved: "Rezervuota",
      Sold: "Parduota",
      Returned: "Grąžinta",
    };
    return statusLabels[status] || status;
  };

  // Order status labels
  const getOrderStatusLabel = (status: OrderStatus): string => {
    return status; // Return raw status as-is
  };

  // Return status labels
  const getReturnStatusLabel = (status: ReturnStatus): string => {
    const statusLabels: Record<ReturnStatus, string> = {
      Requested: "Prašoma",
      Approved: "Patvirtinta",
      Refunded: "Grąžinta",
      Rejected: "Atmesta",
    };
    return statusLabels[status] || status;
  };
  const renderPartCard = (part: Part) => (
    <Card
      key={part.id}
      className="mb-3 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onItemClick?.(part as T)}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <PhotoTableCell
              src={part.photos}
              alt={part.name}
              onClick={() => onItemClick?.(part as T)}
              size="sm"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm truncate">{part.name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {part.carBrand} {part.carModel} ({part.carYear})
            </p>
            <div className="flex justify-between items-center mt-2">
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  getStatusBadgeClass("part", part.status)
                )}
              >
                {getStatusLabel(part.status)}
              </span>
              <div className="text-right">
                <div className="font-medium text-sm">
                  €{part.priceEUR.toFixed(2)}
                </div>
                <div className="text-xs text-muted-foreground">
                  PLN {part.pricePLN.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Additional details grid */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-border/50 text-xs">
              <div>
                <div className="text-muted-foreground">ID</div>
                <div className="truncate font-medium">{part.code}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Sandėlis</div>
                <div className="truncate">{part.warehouse || "-"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Kuro tipas</div>
                <div className="truncate">{part.fuelType || "-"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Variklio tūris</div>
                <div className="truncate">{part.engineVolume || "-"}</div>
              </div>
              <div className="col-span-2">
                <div className="text-muted-foreground">Gamintojo kodas</div>
                <div className="truncate">{part.manufacturerCode || "-"}</div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderOrderCard = (order: Order) => {
    const itemId = order.id;
    const isExpanded = expandedRows?.has(itemId) ?? false;

    return (
      <Fragment key={order.id}>
        <Card className="mb-3">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">Užsakymas #{order.id}</h3>
                <p className="text-xs text-muted-foreground">
                  {order.customer?.name} ({order.customer?.country})
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getStatusBadgeClass("order", order.status)
                    )}
                  >
                    {getOrderStatusLabel(order.status)}
                  </span>
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      €
                      {order.items
                        .reduce(
                          (sum, item) => sum + item.priceEUR * item.quantity,
                          0
                        )
                        .toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.items.length} vnt.
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDateLithuanian(order.date)}
                </div>
              </div>
              {onToggleExpand && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(itemId);
                  }}
                  className="ml-2 h-8 w-8 p-0"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        {isExpanded && renderExpandedRow && (
          <div className="mb-4 mx-2">{renderExpandedRow(order as T)}</div>
        )}
      </Fragment>
    );
  };

  const renderReturnCard = (returnItem: Return) => {
    const itemId = returnItem.id;
    const isExpanded = expandedRows?.has(itemId) ?? false;

    return (
      <Fragment key={returnItem.id}>
        <Card className="mb-3">
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm">
                  Grąžinimas #{returnItem.id}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Užsakymas #{returnItem.orderId}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <span
                    className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getStatusBadgeClass("return", returnItem.status)
                    )}
                  >
                    {getReturnStatusLabel(returnItem.status)}
                  </span>
                  <div className="text-right">
                    <div className="font-medium text-sm">
                      €{returnItem.returnAmount?.toFixed(2) || "0.00"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Grąžinta suma
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {formatDateLithuanian(returnItem.dateCreated)}
                </div>
              </div>
              {onToggleExpand && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(itemId);
                  }}
                  className="ml-2 h-8 w-8 p-0"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        {isExpanded && renderExpandedRow && (
          <div className="mb-4 mx-2">{renderExpandedRow(returnItem as T)}</div>
        )}
      </Fragment>
    );
  };

  const renderCard = (item: T) => {
    switch (type) {
      case LayoutType.PARTS:
        return renderPartCard(item as Part);
      case LayoutType.ORDERS:
        return renderOrderCard(item as Order);
      case LayoutType.RETURNS:
        return renderReturnCard(item as Return);
      default:
        return null;
    }
  };

  return (
    <div className="space-y-2">{data.map((item) => renderCard(item))}</div>
  );
}
