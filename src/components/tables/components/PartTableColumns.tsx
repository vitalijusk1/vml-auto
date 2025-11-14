import { ColumnDef } from "@tanstack/react-table";
import { Part, PartStatus } from "@/types";
import { getStatusBadgeClass } from "@/theme/utils";
import { PhotoTableCell } from "@/components/ui/PhotoTableCell";

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
  onItemClick: (part: Part) => void;
}

export function PartTableColumns({
  onItemClick,
}: PartTableColumnsProps): ColumnDef<Part>[] {
  return [
    {
      accessorKey: "code",
      header: "Detalės id/gamintojo kodas",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.code}</div>
          {row.original.manufacturerCode && (
            <div className="text-xs text-muted-foreground">
              {row.original.manufacturerCode}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "photos",
      header: "Nuotrauka",
      cell: ({ row }) => (
        <PhotoTableCell
          src={row.original.photos}
          alt={row.original.name}
          onClick={() => onItemClick(row.original)}
          size="md"
        />
      ),
    },
    {
      accessorKey: "name",
      header: "Pavadinimas",
      cell: ({ row }) => (
        <div className="font-medium">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "carBrand",
      header: "Automobilis",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.carBrand} {row.original.carModel}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.original.carYear}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "fuelType",
      header: "Kuro tipas",
      cell: ({ row }) => row.original.fuelType || "-",
    },
    {
      accessorKey: "engineVolume",
      header: "Variklio tūris",
      cell: ({ row }) => row.original.engineVolume || "-",
    },
    {
      accessorKey: "quality",
      header: "Kokybė",
      cell: ({ row }) => row.original.quality || "-",
    },
    {
      accessorKey: "status",
      header: "Statusas",
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
      accessorKey: "daysInInventory",
      header: "Laikas sandėly",
      cell: ({ row }) => {
        const days = row.original.daysInInventory;
        let color = "text-inventory-normal";
        if (days > 180) color = "text-inventory-critical";
        else if (days > 90) color = "text-inventory-warning";
        return <span className={color}>{days} d.</span>;
      },
    },
    {
      accessorKey: "priceEUR",
      header: "Kaina",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">€{row.original.priceEUR.toFixed(2)}</div>
          <div className="text-xs text-muted-foreground">
            PLN {row.original.pricePLN.toFixed(2)}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "warehouse",
      header: "Sandėlys",
      cell: ({ row }) => row.original.warehouse || "-",
    },
  ];
}
