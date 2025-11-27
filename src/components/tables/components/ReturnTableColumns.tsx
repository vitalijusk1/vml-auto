import { ColumnDef } from "@tanstack/react-table";
import { Return } from "@/types";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { OrderItemExpandedContent } from "./OrderItemExpandedContent";
import { formatDateLithuanian } from "@/utils/dateFormatting";

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
          {formatDateLithuanian(row.original.dateCreated)}
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
      accessorKey: "refundStatus",
      header: "Grąžinimo būsena",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.refundStatus || "N/A"}</span>
      ),
    },
    {
      accessorKey: "sandelys",
      header: "Sandėlys",
      cell: ({ row }) => (
        <span className="font-semibold">{row.original.accountId ?? "-"}</span>
      ),
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
  onPhotoClick: (photos: string[], title: string) => void,
  isMobile?: boolean
) {
  return (
    <OrderItemExpandedContent
      items={returnItem.items as any}
      title={`Grąžinamos prekės (${returnItem.items.length})`}
      onPhotoClick={onPhotoClick}
      showReason={true}
      showQuantity={false}
      isMobile={isMobile}
    />
  );
}
