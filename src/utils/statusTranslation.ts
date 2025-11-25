import { ReturnStatus } from "@/types";

/**
 * Status translations to Lithuanian (for CSV export)
 * These translations are used when exporting data to CSV files
 * The actual status names come from backend filters
 */
export const STATUS_TRANSLATIONS: Record<string, string> = {
  // Part statuses (names from backend)
  "In Stock": "Sandėlyje",
  "In stock": "Sandėlyje",
  Reserved: "Rezervuota",
  Sold: "Parduota",
  Returned: "Grąžinta",
  // Order statuses
  NEW: "Naujas",
  PREPARED: "Paruoštas",
  SENT: "Išsiųstas",
  DELIVERED: "Pristatytas",
  CANCELLED: "Atšauktas",
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
 * Translate status value to Lithuanian (for CSV export)
 * Returns original value if no translation found
 */
export function translateStatus(status: string): string {
  return STATUS_TRANSLATIONS[status] ?? status;
}

/**
 * Map API return status string to ReturnStatus type
 * This categorizes various return status strings into standard types
 */
export function mapReturnStatus(status: string): ReturnStatus {
  const statusLower = status.toLowerCase();
  if (
    statusLower.includes("returned") ||
    statusLower.includes("refunded") ||
    statusLower === "paid_out"
  ) {
    return "Refunded";
  }
  if (statusLower.includes("approved")) {
    return "Approved";
  }
  if (statusLower.includes("rejected")) {
    return "Rejected";
  }
  return "Requested";
}
