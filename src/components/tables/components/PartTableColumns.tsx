import { ColumnDef } from "@tanstack/react-table";
import { Part, PartStatus } from "@/types";
import { format } from "date-fns";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getStatusBadgeClass } from "@/theme/utils";

const getPartStatusClass = (status: PartStatus) => {
  const statusMap: Record<PartStatus, string> = {
    "In Stock": getStatusBadgeClass("part", "In Stock"),
    Reserved: getStatusBadgeClass("part", "Reserved"),
    Sold: getStatusBadgeClass("part", "Sold"),
    Returned: getStatusBadgeClass("part", "Returned"),
  };
  return statusMap[status] || getStatusBadgeClass("part", "Returned");
};

interface PartTableColumnsProps {
  selectedParts: string[];
  onSelectAll: (checked: boolean) => void;
  onToggleSelection: (partId: string) => void;
  onItemClick: (part: Part) => void;
}

export function PartTableColumns({
  selectedParts,
  onSelectAll,
  onToggleSelection,
  onItemClick,
}: PartTableColumnsProps): ColumnDef<Part>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => onSelectAll(e.target.checked)}
          className="rounded border-gray-300"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedParts.includes(row.original.id)}
          onChange={() => onToggleSelection(row.original.id)}
          className="rounded border-gray-300"
        />
      ),
    },
    {
      accessorKey: "photos",
      header: "Photo",
      cell: ({ row }) => (
        <img
          src={row.original.photos[0]}
          alt={row.original.name}
          className="w-12 h-12 object-cover rounded"
        />
      ),
    },
    {
      accessorKey: "code",
      header: "Part ID / Code",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.code}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.id}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: "Part Name / Category",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.name}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.category}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "carBrand",
      header: "Car Brand & Model",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.carBrand} {row.original.carModel}
          </div>
          <div className="text-xs text-muted-foreground">
            Year: {row.original.carYear}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "partType",
      header: "Part Type",
    },
    {
      accessorKey: "manufacturerCode",
      header: "Manufacturer Code",
      cell: ({ row }) => row.original.manufacturerCode || "N/A",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getPartStatusClass(
            row.original.status
          )}`}
        >
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: "priceEUR",
      header: "Price (EUR/PLN)",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">€{row.original.priceEUR}</div>
          <div className="text-xs text-muted-foreground">
            PLN {row.original.pricePLN}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "daysInInventory",
      header: "Days in Inventory",
      cell: ({ row }) => {
        const days = row.original.daysInInventory;
        let color = "text-inventory-normal";
        if (days > 180) color = "text-inventory-critical";
        else if (days > 90) color = "text-inventory-warning";
        return <span className={color}>{days}</span>;
      },
    },
    {
      accessorKey: "dateAdded",
      header: "Date Added",
      cell: ({ row }) => format(row.original.dateAdded, "MMM dd, yyyy"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onItemClick(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}

