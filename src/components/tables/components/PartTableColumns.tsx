import { ColumnDef } from "@tanstack/react-table";
import { Part, PartStatus, Order, TopDetailsFilter } from "@/types";
import { getStatusBadgeClass } from "@/theme/utils";
import { PhotoTableCell } from "@/components/ui/PhotoTableCell";
import { getLocalizedText } from "@/utils/i18n";

const getPartStatusClass = (status: PartStatus) => {
  const statusMap: Record<PartStatus, string> = {
    "In Stock": getStatusBadgeClass("part", "In Stock"),
    Reserved: getStatusBadgeClass("part", "Reserved"),
    Sold: getStatusBadgeClass("part", "Sold"),
    Returned: getStatusBadgeClass("part", "Returned"),
  };
  return statusMap[status] || getStatusBadgeClass("part", "Returned");
};

// Helper to find status from backend filters by matching English name
const findStatusFromBackend = (
  status: PartStatus,
  backendFilters: any
): string | null => {
  const statuses = backendFilters?.parts?.statuses;
  if (!Array.isArray(statuses)) return null;

  // Map English status to find matching FilterOption
  const statusNameMap: Record<PartStatus, string> = {
    "In Stock": "In Stock",
    Reserved: "Reserved",
    Sold: "Sold",
    Returned: "Returned",
  };
  const englishName = statusNameMap[status];

  // Map to Lithuanian names for matching
  const lithuanianNameMap: Record<PartStatus, string> = {
    "In Stock": "Sandėlyje",
    Reserved: "Rezervuota",
    Sold: "Parduota",
    Returned: "Grąžinta",
  };
  const lithuanianName = lithuanianNameMap[status];

  for (const statusOption of statuses) {
    if (typeof statusOption === "string") {
      // Try matching both English and Lithuanian
      if (statusOption === englishName || statusOption === lithuanianName) {
        return statusOption;
      }
    } else if (statusOption && typeof statusOption === "object") {
      // Check if this FilterOption matches by Lithuanian or English name
      const ltName = statusOption.languages?.lt;
      const enName = statusOption.languages?.en;
      const optionName = statusOption.languages?.name || statusOption.name;

      // Match by Lithuanian first, then English, then fallback name
      if (
        ltName === lithuanianName ||
        ltName === englishName ||
        enName === englishName ||
        optionName === englishName
      ) {
        // Return localized version (prioritizes Lithuanian)
        return getLocalizedText(statusOption.languages, statusOption.name);
      }
    }
  }
  return null;
};

const getStatusLabel = (status: PartStatus, backendFilters: any): string => {
  // Try to get from backend filters first (with language support)
  const backendStatus = findStatusFromBackend(status, backendFilters);
  if (backendStatus) return backendStatus;

  // Fallback to hardcoded translations
  const statusLabels: Record<PartStatus, string> = {
    "In Stock": "Sandėlyje",
    Reserved: "Rezervuota",
    Sold: "Parduota",
    Returned: "Grąžinta",
  };
  return statusLabels[status] || status;
};

interface PartTableColumnsProps {
  onItemClick: (part: Part) => void;
  backendFilters?: any;
  topDetailsFilter?: TopDetailsFilter;
  orders?: Order[];
}

export function PartTableColumns({
  onItemClick,
  backendFilters,
  topDetailsFilter,
  orders = [],
}: PartTableColumnsProps): ColumnDef<Part>[] {
  const isTopSellingMode = topDetailsFilter === TopDetailsFilter.TOP_SELLING;

  // Calculate sold count and average price for a part
  const getPartSalesData = (part: Part) => {
    let soldCount = 0;
    let totalPrice = 0;
    let priceCount = 0;

    orders
      .filter((o) => o.status === "Delivered")
      .forEach((order) => {
        order.items.forEach((item) => {
          if (item.partId === part.id) {
            soldCount += item.quantity;
            totalPrice += item.priceEUR * item.quantity;
            priceCount += item.quantity;
          }
        });
      });

    const avgPrice = priceCount > 0 ? totalPrice / priceCount : part.priceEUR;
    const inStock = part.status === "In Stock" ? 1 : 0;

    return { soldCount, avgPrice, inStock };
  };

  // If top selling mode, return different columns
  if (isTopSellingMode) {
    return [
      {
        accessorKey: "manufacturerCode",
        header: "Gamintojo kodas",
        cell: ({ row }) => row.original.manufacturerCode || "-",
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
        accessorKey: "bodyType",
        header: "Kebulo tipas",
        cell: () => {
          // Body type is not directly in Part, would need to fetch from car
          // For now, show "-" or we could add it to Part type later
          return "-";
        },
      },
      {
        accessorKey: "engineVolume",
        header: "Variklio turis",
        cell: ({ row }) => row.original.engineVolume || "-",
      },
      {
        accessorKey: "turetaParduota",
        header: "Tureta/Parduota",
        cell: ({ row }) => {
          const { soldCount } = getPartSalesData(row.original);
          const part = row.original;
          const hasInStock =
            part.status === "In Stock" || part.status === "Reserved";
          return (
            <div>
              {hasInStock && <div className="text-sm">Tureta: 1</div>}
              {soldCount > 0 && (
                <div
                  className={`text-sm ${
                    hasInStock ? "text-xs text-muted-foreground" : ""
                  }`}
                >
                  Parduota: {soldCount}
                </div>
              )}
              {!hasInStock && soldCount === 0 && (
                <div className="text-sm">Parduota</div>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "warehouse",
        header: "Sandėly",
        cell: ({ row }) => row.original.warehouse || "-",
      },
      {
        accessorKey: "avgPrice",
        header: "Vid. kaina",
        cell: ({ row }) => {
          const { avgPrice } = getPartSalesData(row.original);
          return (
            <div>
              <div className="font-medium">€{avgPrice.toFixed(2)}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "warehouses",
        header: "Sandėlys",
        cell: ({ row }) => row.original.warehouse || "-",
      },
    ];
  }

  // Default columns
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
      cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
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
          {getStatusLabel(row.original.status, backendFilters)}
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
