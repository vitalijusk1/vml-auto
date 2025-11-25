import { statusColorMap } from "./theme";

/**
 * Get status color classes for badges
 */
export function getStatusBadgeClass(
  entityType: keyof typeof statusColorMap,
  status: string
): string {
  const colorKey =
    statusColorMap[entityType]?.[
      status as keyof (typeof statusColorMap)[typeof entityType]
    ];

  if (!colorKey) {
    return "bg-status-neutral-bg/10 text-status-neutral-text";
  }

  const colorClassMap: Record<string, string> = {
    success: "bg-status-success-bg/10 text-status-success-text",
    warning: "bg-status-warning-bg/10 text-status-warning-text",
    error: "bg-status-error-bg/10 text-status-error-text",
    info: "bg-status-info-bg/10 text-status-info-text",
    neutral: "bg-status-neutral-bg/10 text-status-neutral-text",
  };

  return colorClassMap[colorKey] || colorClassMap.neutral;
}

/**
 * Get part status badge class from numeric status ID
 * Maps status IDs to status names and returns appropriate badge class
 */
export function getPartStatusClass(statusId: number | undefined): string {
  switch (statusId) {
    case 0:
      return getStatusBadgeClass("part", "In Stock");
    case 1:
      return getStatusBadgeClass("part", "Reserved");
    case 2:
      return getStatusBadgeClass("part", "Sold");
    case 3:
      return getStatusBadgeClass("part", "Returned");
    default:
      return getStatusBadgeClass("part", "Returned");
  }
}
