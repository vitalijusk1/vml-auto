import { ColumnDef } from "@tanstack/react-table";
import { Return } from "@/types";
import { getStatusBadgeClass } from "@/theme/utils";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { OrderItemExpandedContent } from "./OrderItemExpandedContent";

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

interface ReturnTableColumnsProps {
  onToggleExpand: (returnId: string) => void;
  isExpanded: (returnId: string) => boolean;
}

export function ReturnTableColumns({
  onToggleExpand,
  isExpanded,
}: ReturnTableColumnsProps): ColumnDef<Return>[] {
  return [
    {
      accessorKey: "orderId",
      header: "Užsakymo Nr.",
      cell: ({ row }) => (
        <span className="font-semibold">
          {row.original.itemOrderId || row.original.orderId || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "id",
      header: "Grąžinimo Nr.",
      cell: ({ row }) => (
        <span className="font-semibold">
          {row.original.itemId || row.original.id || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "dateCreated",
      header: "Grąžinimo sukūrimo data",
      cell: ({ row }) => (
        <span className="font-semibold">
          {formatReturnDate(row.original.dateCreated)}
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
        const returnItem = row.original;
        const expanded = isExpanded(returnItem.id);
        return (
          <button
            onClick={() => onToggleExpand(returnItem.id)}
            className="flex items-center gap-2 hover:text-primary transition-colors font-semibold"
          >
            <span>{returnItem.items.length}</span>
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
      accessorKey: "returnAmount",
      header: "Grąžintina suma",
      cell: ({ row }) => (
        <div>
          <div className="font-semibold">
            €{(row.original.returnAmount || 0).toLocaleString()}
          </div>
          {row.original.refundableAmountPLN > 0 && (
            <div className="text-xs text-muted-foreground">
              PLN {(row.original.refundableAmountPLN || 0).toLocaleString()}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "returnStatus",
      header: "Grąžinimo statusas",
      cell: ({ row }) => {
        // Use the mapped status for color, but display the raw returnStatus string
        const status = row.original.status || "Requested";
        const displayStatus = row.original.returnStatus || "N/A";
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
              "return",
              status
            )}`}
          >
            {displayStatus}
          </span>
        );
      },
    },
    {
      accessorKey: "refundStatus",
      header: "Grąžinimo būsena",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.refundStatus || "N/A"}</span>
      ),
    },
    {
      id: "warehouse",
      header: "Sandėlys",
      cell: () => <span className="text-sm text-muted-foreground">N/A</span>,
    },
    {
      id: "action",
      header: "Veiksmas",
      cell: ({ row }) => {
        const returnItem = row.original;
        if (returnItem.creditNoteUrl) {
          return (
            <button
              onClick={() => {
                window.open(returnItem.creditNoteUrl, "_blank");
              }}
              className="flex items-center justify-center w-8 h-8 rounded hover:bg-muted transition-colors"
              title="Peržiūrėti sąskaitą faktūrą"
            >
              <Eye className="h-4 w-4 text-primary" />
            </button>
          );
        }
        return <span className="text-sm text-muted-foreground">-</span>;
      },
    },
  ];
}

// Helper component to render expanded return items
export function renderReturnExpandedContent(
  returnItem: Return,
  onPhotoClick: (photos: string[], title: string) => void
) {
  return (
    <OrderItemExpandedContent
      items={returnItem.items as any}
      title={`Grąžinamos prekės (${returnItem.items.length})`}
      onPhotoClick={onPhotoClick}
      showReason={true}
      showQuantity={false}
    />
  );
}
