/**
 * Global Theme Configuration
 *
 * This file contains all theme values (colors, font sizes, spacing, etc.)
 * that can be changed in one place and will update throughout the application.
 */

export const theme = {
  colors: {
    // Status colors
    status: {
      success: {
        bg: "hsl(var(--status-success-bg))",
        text: "hsl(var(--status-success-text))",
        border: "hsl(var(--status-success-border))",
      },
      warning: {
        bg: "hsl(var(--status-warning-bg))",
        text: "hsl(var(--status-warning-text))",
        border: "hsl(var(--status-warning-border))",
      },
      error: {
        bg: "hsl(var(--status-error-bg))",
        text: "hsl(var(--status-error-text))",
        border: "hsl(var(--status-error-border))",
      },
      info: {
        bg: "hsl(var(--status-info-bg))",
        text: "hsl(var(--status-info-text))",
        border: "hsl(var(--status-info-border))",
      },
      neutral: {
        bg: "hsl(var(--status-neutral-bg))",
        text: "hsl(var(--status-neutral-text))",
        border: "hsl(var(--status-neutral-border))",
      },
    },

    // Semantic colors for metrics cards
    metrics: {
      primary: {
        bg: "hsl(var(--metrics-primary-bg))",
        text: "hsl(var(--metrics-primary-text))",
      },
      secondary: {
        bg: "hsl(var(--metrics-secondary-bg))",
        text: "hsl(var(--metrics-secondary-text))",
      },
      tertiary: {
        bg: "hsl(var(--metrics-tertiary-bg))",
        text: "hsl(var(--metrics-tertiary-text))",
      },
      revenue: {
        bg: "hsl(var(--metrics-revenue-bg))",
        text: "hsl(var(--metrics-revenue-text))",
      },
      warning: {
        bg: "hsl(var(--metrics-warning-bg))",
        text: "hsl(var(--metrics-warning-text))",
      },
      danger: {
        bg: "hsl(var(--metrics-danger-bg))",
        text: "hsl(var(--metrics-danger-text))",
      },
    },

    // Inventory age colors
    inventory: {
      new: {
        text: "hsl(var(--inventory-new-text))",
      },
      normal: {
        text: "hsl(var(--inventory-normal-text))",
      },
      warning: {
        text: "hsl(var(--inventory-warning-text))",
      },
      critical: {
        text: "hsl(var(--inventory-critical-text))",
      },
    },

    // Chart colors
    charts: {
      primary: "#0088FE",
      secondary: "#00C49F",
      tertiary: "#FFBB28",
      quaternary: "#FF8042",
      quinary: "#8884d8",
      senary: "#82ca9d",
    },
  },

  borderRadius: {
    sm: "0.125rem", // 2px
    md: "0.375rem", // 6px
    lg: "0.5rem", // 8px
    xl: "0.75rem", // 12px
    full: "9999px",
  },
} as const;

// Status color mappings for different entity types
export const statusColorMap = {
  car: {
    Purchased: "info",
    "For Dismantling": "warning",
    Dismantled: "success",
    Sold: "neutral",
  },
  part: {
    "In Stock": "success",
    Reserved: "warning",
    Sold: "info",
    Returned: "neutral",
  },
  order: {
    Pending: "warning",
    Processing: "info",
    Shipped: "info",
    Delivered: "success",
    Cancelled: "error",
  },
  return: {
    Requested: "warning",
    Approved: "info",
    Refunded: "success",
    Rejected: "error",
  },
} as const;
