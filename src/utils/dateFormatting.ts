/**
 * Lithuanian date formatting utilities
 */

const LITHUANIAN_MONTHS = [
  "Sau",
  "Vas",
  "Kov",
  "Bal",
  "Geg",
  "Bir",
  "Lie",
  "Rugp",
  "Rugs",
  "Spa",
  "Lap",
  "Gru",
];

/**
 * Format date to Lithuanian format (e.g., "Lap 24, 2025")
 */
export const formatDateLithuanian = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "N/A";
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "N/A";
    }
    const month = LITHUANIAN_MONTHS[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    return `${month} ${day}, ${year}`;
  } catch (error) {
    console.error("Error formatting date:", error, date);
    return "N/A";
  }
};

/**
 * Format date to Lithuanian format with time (e.g., "Lap 24, 2025 14:30")
 */
export const formatDateTimeLithuanian = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "N/A";
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "N/A";
    }
    const month = LITHUANIAN_MONTHS[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  } catch (error) {
    console.error("Error formatting date:", error, date);
    return "N/A";
  }
};

/**
 * Format date to Lithuanian locale string (e.g., "2025-11-24")
 */
export const formatDateLocale = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "N/A";
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "N/A";
    }
    return dateObj.toLocaleDateString("lt-LT");
  } catch (error) {
    console.error("Error formatting date:", error, date);
    return "N/A";
  }
};

/**
 * Format date for chart display (e.g., "Lap 24")
 */
export const formatDateChartLithuanian = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "N/A";
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) {
      return "N/A";
    }
    const month = LITHUANIAN_MONTHS[dateObj.getMonth()];
    const day = dateObj.getDate();
    return `${month} ${day}`;
  } catch (error) {
    console.error("Error formatting date:", error, date);
    return "N/A";
  }
};
