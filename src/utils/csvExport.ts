import { Part, Order, Return } from "@/types";

// Status translations to Lithuanian
const statusTranslations: Record<string, string> = {
  "In Stock": "Sandėlyje",
  "In stock": "Sandėlyje",
  Reserved: "Rezervuota",
  Sold: "Parduota",
  Returned: "Grąžinta",
  // Order statuses
  Pending: "Laukiama",
  Processing: "Vykdoma",
  Shipped: "Išsiųsta",
  Delivered: "Pristatyta",
  Cancelled: "Atšaukta",
  // Return statuses
  Requested: "Pateikta",
  Approved: "Patvirtinta",
  Refunded: "Grąžinta",
  Rejected: "Atmesta",
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
export function exportToCSV<T extends Record<string, any>>(
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
        if (
          String(key).toLowerCase().includes("status") ||
          statusTranslations[stringValue]
        ) {
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
  const flatOrders = orders.map((order) => ({
    id: order.id,
    date: order.date ? new Date(order.date).toLocaleDateString("lt-LT") : "",
    customerName: order.customer?.name || "",
    customerEmail: order.customer?.email || "",
    customerPhone: order.customer?.phone || "",
    city: order.customer?.city || "",
    country: order.customer?.country || "",
    itemsCount: order.items?.length || 0,
    itemsSummary: order.items
      ?.map((i) => `${i.partName} (${i.quantity})`)
      .join("; "),
    totalAmountEUR: order.totalAmountEUR,
    shippingCostEUR: order.shippingCostEUR,
    status: order.status,
    paymentMethod: order.paymentMethod,
    shippingStatus: order.shippingStatus,
  }));

  const columns = [
    "id",
    "date",
    "customerName",
    "customerEmail",
    "customerPhone",
    "city",
    "country",
    "itemsCount",
    "itemsSummary",
    "totalAmountEUR",
    "shippingCostEUR",
    "status",
    "paymentMethod",
    "shippingStatus",
  ] as (keyof (typeof flatOrders)[0])[];

  const columnLabels: Record<string, string> = {
    id: "Užsakymo ID",
    date: "Data",
    customerName: "Klientas",
    customerEmail: "El. paštas",
    customerPhone: "Telefonas",
    city: "Miestas",
    country: "Šalis",
    itemsCount: "Prekių kiekis",
    itemsSummary: "Prekės",
    totalAmountEUR: "Suma (EUR)",
    shippingCostEUR: "Siuntimas (EUR)",
    status: "Statusas",
    paymentMethod: "Mokėjimo būdas",
    shippingStatus: "Siuntimo statusas",
  };

  exportToCSV(
    flatOrders,
    `orders_${new Date().toISOString().split("T")[0]}.csv`,
    columns,
    columnLabels
  );
}

/**
 * Export returns data to CSV with selected columns
 */
export function exportReturnsToCSV(returns: Return[]) {
  const flatReturns = returns.map((ret) => ({
    id: ret.id,
    orderId: ret.orderId,
    dateCreated: ret.dateCreated
      ? new Date(ret.dateCreated).toLocaleDateString("lt-LT")
      : "",
    customerName: ret.customer?.name || "",
    itemsCount: ret.items?.length || 0,
    itemsSummary: ret.items?.map((i) => i.partName).join("; "),
    reasons: [...new Set(ret.items?.map((i) => i.reason))].join("; "),
    refundableAmountEUR: ret.refundableAmountEUR,
    returnStatus: ret.returnStatus,
    refundStatus: ret.refundStatus,
  }));

  const columns = [
    "id",
    "orderId",
    "dateCreated",
    "customerName",
    "itemsCount",
    "itemsSummary",
    "reasons",
    "refundableAmountEUR",
    "returnStatus",
    "refundStatus",
  ] as (keyof (typeof flatReturns)[0])[];

  const columnLabels: Record<string, string> = {
    id: "Grąžinimo ID",
    orderId: "Užsakymo ID",
    dateCreated: "Sukurta",
    customerName: "Klientas",
    itemsCount: "Prekių kiekis",
    itemsSummary: "Prekės",
    reasons: "Priežastys",
    refundableAmountEUR: "Grąžintina suma (EUR)",
    returnStatus: "Grąžinimo būsena",
    refundStatus: "Pinigų grąžinimo būsena",
  };

  exportToCSV(
    flatReturns,
    `returns_${new Date().toISOString().split("T")[0]}.csv`,
    columns,
    columnLabels
  );
}
