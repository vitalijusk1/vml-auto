import { Part, Order, Return, Car } from "@/types";

type TableData = Part | Order | Return | Car;

// Status translations to Lithuanian
const statusTranslations: Record<string, string> = {
  "In Stock": "Sandėlyje",
  "In stock": "Sandėlyje",
  Reserved: "Rezervuota",
  Sold: "Parduota",
  Returned: "Grąžinta",
};

/**
 * Translate status value to Lithuanian if available
 */
function translateStatus(value: string): string {
  return statusTranslations[value] || value;
}

/**
 * Convert data to CSV format and trigger download
 */
export function exportToCSV<T extends TableData>(
  data: T[],
  filename: string,
  columns?: (keyof T)[],
  columnLabels?: Record<string, string>
) {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Get all keys if columns not specified
  const keys = columns || (Object.keys(data[0]) as (keyof T)[]);

  // Create CSV header with Lithuanian labels if provided
  const header = keys
    .map((key) => columnLabels?.[String(key)] || String(key))
    .join(",");

  // Create CSV rows
  const rows = data.map((item) =>
    keys
      .map((key) => {
        const value = item[key];
        // Handle nested objects and arrays
        if (value === null || value === undefined) {
          return "";
        }
        if (typeof value === "object") {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        // Escape quotes and wrap in quotes if contains comma
        let stringValue = String(value);

        // Translate status values to Lithuanian
        if (String(key) === "status") {
          stringValue = translateStatus(stringValue);
        }

        if (stringValue.includes(",") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(",")
  );

  // Combine header and rows
  const csv = [header, ...rows].join("\n");

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export parts data to CSV with selected columns
 */
export function exportPartsToCSV(parts: Part[]) {
  const columns: (keyof Part)[] = [
    "code",
    "name",
    "carBrand",
    "carModel",
    "carYear",
    "priceEUR",
    "pricePLN",
    "status",
    "daysInInventory",
  ];

  const columnLabels: Record<string, string> = {
    code: "Detales ID",
    name: "Pavadinimas",
    carBrand: "Gamintojas",
    carModel: "Modelis",
    carYear: "Metai",
    priceEUR: "Kaina (EUR)",
    pricePLN: "Kaina (PLN)",
    status: "Statusas",
    daysInInventory: "Dienos sandėlyje",
  };

  exportToCSV(
    parts,
    `parts_${new Date().toISOString().split("T")[0]}.csv`,
    columns,
    columnLabels
  );
}

/**
 * Export orders data to CSV with selected columns
 */
export function exportOrdersToCSV(orders: Order[]) {
  const columns: (keyof Order)[] = ["id", "status"];

  const columnLabels: Record<string, string> = {
    id: "Užsakymo ID",
    status: "Statusas",
  };

  exportToCSV(
    orders,
    `orders_${new Date().toISOString().split("T")[0]}.csv`,
    columns,
    columnLabels
  );
}

/**
 * Export returns data to CSV with selected columns
 */
export function exportReturnsToCSV(returns: Return[]) {
  const columns: (keyof Return)[] = ["id", "status"];

  const columnLabels: Record<string, string> = {
    id: "Grąžinimo ID",
    status: "Statusas",
  };

  exportToCSV(
    returns,
    `returns_${new Date().toISOString().split("T")[0]}.csv`,
    columns,
    columnLabels
  );
}
