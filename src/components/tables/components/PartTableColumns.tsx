import { ColumnDef } from "@tanstack/react-table";
import { Part, Order, TopDetailsFilter } from "@/types";
import { getPartStatusClass } from "@/theme/utils";
import { PhotoTableCell } from "@/components/ui/PhotoTableCell";
import { getLocalizedText } from "@/utils/i18n";

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
  const isAnalyticsMode =
    topDetailsFilter === TopDetailsFilter.TOP_SELLING ||
    topDetailsFilter === TopDetailsFilter.LEAST_SELLING;

  // Calculate sold count and average price for a part
  const getPartSalesData = (part: Part) => {
    let soldCount = 0;
    let totalPrice = 0;
    let priceCount = 0;

    orders
      .filter((o) => o.status === "DELIVERED")
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
    const inStock = part.statusId === 0 ? 1 : 0;

    return { soldCount, avgPrice, inStock };
  };

  // If analytics mode (top selling or least selling), return different columns without expand functionality
  if (isAnalyticsMode) {
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
        cell: ({ row }) =>
          row.original.engineVolume ? `${row.original.engineVolume}cc` : "-",
      },
      {
        accessorKey: "turetaParduota",
        header: "Tureta/Parduota",
        cell: ({ row }) => {
          const part = row.original;
          // Calculate based on statuses: tureta = all items (sum of all statuses), parduota = status 2 (Sold)
          const inStock = part.statuses?.["0"] || 0;
          const reserved = part.statuses?.["1"] || 0;
          const sold = part.statuses?.["2"] || 0;
          const tureta = inStock + reserved + sold;
          return (
            <div className="text-sm">
              <div>Tureta: {tureta}</div>
              <div className="text-xs text-muted-foreground">
                Parduota: {sold}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "sandely",
        header: "Sandėly",
        cell: ({ row }) => {
          const part = row.original;
          // Show count of parts with status 0 (in stock)
          const inStockCount = part.statuses ? part.statuses[0] || 0 : 0;
          return <div>{inStockCount}</div>;
        },
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
    ];
  }

  // Default columns
  return [
    {
      accessorKey: "code",
      header: "Detalės id",
      cell: ({ row }) => <div className="font-medium">{row.original.code}</div>,
    },
    {
      accessorKey: "manufacturerCode",
      header: "Gamintojo kodas",
      cell: ({ row }) => <div>{row.original.manufacturerCode || "-"}</div>,
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
      cell: ({ row }) =>
        row.original.engineVolume ? `${row.original.engineVolume}cc` : "-",
    },
    {
      accessorKey: "quality",
      header: "Kokybė",
      cell: ({ row }) =>
        getQualityLabel(row.original.qualityId, backendFilters),
    },
    {
      accessorKey: "status",
      header: "Statusas",
      cell: ({ row }) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${getPartStatusClass(
            row.original.statusId
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
        </div>
      ),
    },
  ];
}
