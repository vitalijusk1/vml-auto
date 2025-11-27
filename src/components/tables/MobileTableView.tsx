import { Fragment } from "react";
import { Car, Part, Order, Return, OrderStatus } from "@/types";
import { LayoutType } from "../filters/type";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PhotoTableCell } from "@/components/ui/PhotoTableCell";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateLithuanian } from "@/utils/dateFormatting";
import { getStatusBadgeClass, getPartStatusClass } from "@/theme/utils";
import { getLocalizedText } from "@/utils/i18n";

interface MobileTableViewProps<T extends Car | Part | Order | Return> {
  type: Exclude<LayoutType, "analytics" | "order-control">;
  data: T[];
  expandedRows?: Set<string>;
  onToggleExpand?: (id: string) => void;
  renderExpandedRow?: (item: T) => React.ReactNode;
  onItemClick?: (item: T) => void;
  backendFilters?: any;
}

// Helper to find quality name from backend filters by ID
const findQualityFromBackend = (
  qualityId: number | undefined,
  backendFilters: any
): string | null => {
  if (!qualityId) return null;
  const qualities = backendFilters?.parts?.qualities;
  if (!Array.isArray(qualities)) return null;

  for (const qualityOption of qualities) {
    if (qualityOption && typeof qualityOption === "object") {
      if (qualityOption.id === qualityId) {
        // Return localized version (prioritizes Lithuanian)
        return getLocalizedText(qualityOption.languages, qualityOption.name);
      }
    }
  }
  return null;
};

const getQualityLabel = (
  qualityId: number | undefined,
  backendFilters: any
): string => {
  // Try to get from backend filters first (with language support)
  const backendQuality = findQualityFromBackend(qualityId, backendFilters);
  if (backendQuality) return backendQuality;

  // Fallback if not found
  return "-";
};

// Get status badge class for order statuses
const getOrderStatusClass = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, string> = {
    NEW: getStatusBadgeClass("order", "Pending"),
    PREPARED: getStatusBadgeClass("order", "Processing"),
    SENT: getStatusBadgeClass("order", "Shipped"),
    DELIVERED: getStatusBadgeClass("order", "Delivered"),
    CANCELLED: getStatusBadgeClass("order", "Cancelled"),
  };
  return statusMap[status] || getStatusBadgeClass("order", "Pending");
};

export function MobileTableView<T extends Car | Part | Order | Return>({
  type,
  data,
  expandedRows,
  onToggleExpand,
  renderExpandedRow,
  onItemClick,
  backendFilters,
}: MobileTableViewProps<T>) {
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
                  getPartStatusClass(part.statusId)
                )}
              >
                {part.status}
              </span>
              <div className="text-right">
                <div className="font-medium text-sm">
                  €{part.priceEUR.toFixed(2)}
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
                <div className="text-muted-foreground">Sandėly</div>
                <div className="truncate">
                  {part.statuses ? part.statuses[0] || 0 : 0}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Sandėlys</div>
                <div className="truncate">{part.accountId ?? "-"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Kuro tipas</div>
                <div className="truncate">{part.fuelType || "-"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Kebulo tipas</div>
                <div className="truncate">{part.bodyType || "-"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Variklio tūris</div>
                <div className="truncate">
                  {part.engineVolume ? `${part.engineVolume}cc` : "-"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Gamintojo kodas</div>
                <div className="truncate">{part.manufacturerCode || "-"}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Kokybė</div>
                <div className="truncate">
                  {getQualityLabel(part.qualityId, backendFilters)}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Laikas sandėly</div>
                <div className="truncate">
                  {(() => {
                    const days = part.daysInInventory;
                    let color = "text-inventory-normal";
                    if (days > 180) color = "text-inventory-critical";
                    else if (days > 90) color = "text-inventory-warning";
                    return <span className={color}>{days} d.</span>;
                  })()}
                </div>
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
                      getOrderStatusClass(order.status)
                    )}
                  >
                    {order.status}
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
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatDateLithuanian(order.date)}</span>
                  <span>Sandėlys: {order.accountId ?? "-"}</span>
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
            {isExpanded && renderExpandedRow && (
              <div className="mt-4 pt-4 border-t border-border/50">
                {renderExpandedRow(order as T)}
              </div>
            )}
          </CardContent>
        </Card>
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
                    {returnItem.status}
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
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{formatDateLithuanian(returnItem.dateCreated)}</span>
                  <span>Sandėlys: {returnItem.accountId ?? "-"}</span>
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
            {isExpanded && renderExpandedRow && (
              <div className="mt-4 pt-4 border-t border-border/50">
                {renderExpandedRow(returnItem as T)}
              </div>
            )}
          </CardContent>
        </Card>
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
