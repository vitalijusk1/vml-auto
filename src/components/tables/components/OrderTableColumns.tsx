import { ColumnDef } from "@tanstack/react-table";
import { Order, OrderStatus } from "@/types";
import { getStatusBadgeClass } from "@/theme/utils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { OrderItemExpandedContent } from "./OrderItemExpandedContent";
import { formatDateLithuanian } from "@/utils/dateFormatting";

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

// Translate order status to display label
const getOrderStatusLabel = (status: OrderStatus): string => {
  return status; // Return raw status as-is
};

interface OrderTableColumnsProps {
  onToggleExpand: (orderId: string) => void;
  isExpanded: (orderId: string) => boolean;
}

export function OrderTableColumns({
  onToggleExpand,
  isExpanded,
}: OrderTableColumnsProps): ColumnDef<Order>[] {
  return [
    {
      accessorKey: "id",
      header: "Užsakymo Nr.",
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.id}</span>
      ),
    },
    {
      accessorKey: "date",
      header: "Data",
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatDateLithuanian(row.original.date)}
        </span>
      ),
    },
    {
      accessorKey: "customer",
      header: "Užsakovas",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold">
            {row.original.customer?.name || "Unknown"}
          </div>
          {row.original.customer?.isCompany && (
            <div className="text-xs text-muted-foreground">
              {row.original.customer.companyName}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "country",
      header: "Šalis",
      cell: ({ row }) => (
        <span className="font-semibold">
          {row.original.customer?.country || "N/A"}
        </span>
      ),
    },
    {
      id: "itemsCount",
      header: "Kiekis",
      cell: ({ row }) => {
        const order = row.original;
        const expanded = isExpanded(order.id);
        return (
          <button
            onClick={() => onToggleExpand(order.id)}
            className="flex items-center gap-2 hover:text-primary transition-colors font-semibold"
          >
            <span>{order.items.length}</span>
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        );
      },
    },
    {
      accessorKey: "totalAmountEUR",
      header: "Sumokėta",
      cell: ({ row }) => (
        <div className="font-semibold">
          €{(row.original.totalAmountEUR || 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "shippingCostEUR",
      header: "Pristatymas",
      cell: ({ row }) => (
        <div className="font-semibold">
          €{(row.original.shippingCostEUR || 0).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Statusas",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusClass(
            row.original.status
          )}`}
        >
          {getOrderStatusLabel(row.original.status)}
        </span>
      ),
    },
    {
      accessorKey: "sandelys",
      header: "Sandėlys",
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.accountId ?? "-"}</span>
      ),
    },
  ];
}

// Helper component to render expanded order items
export function renderOrderExpandedContent(
  order: Order,
  onPhotoClick: (photos: string[], title: string) => void,
  isMobile?: boolean
) {
  return (
    <OrderItemExpandedContent
      items={order.items}
      title={`Užsakytos prekės (${order.items.length})`}
      onPhotoClick={onPhotoClick}
      showReason={false}
      showQuantity={true}
      isMobile={isMobile}
    />
  );
}
