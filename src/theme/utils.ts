import { statusColorMap } from './theme';

/**
 * Get status color class names based on entity type and status
 */
export function getStatusColorClass(
  entityType: keyof typeof statusColorMap,
  status: string
): string {
  const colorKey = statusColorMap[entityType]?.[status as keyof typeof statusColorMap[typeof entityType]];
  
  if (!colorKey) {
    return 'bg-status-neutral-bg/10 text-status-neutral-text';
  }
  
  // Map color keys to Tailwind class names
  const colorClassMap: Record<string, string> = {
    success: 'bg-status-success-bg/10 text-status-success-text',
    warning: 'bg-status-warning-bg/10 text-status-warning-text',
    error: 'bg-status-error-bg/10 text-status-error-text',
    info: 'bg-status-info-bg/10 text-status-info-text',
    neutral: 'bg-status-neutral-bg/10 text-status-neutral-text',
  };
  
  return colorClassMap[colorKey] || colorClassMap.neutral;
}

/**
 * Get status color classes with full opacity (for badges)
 * Returns Tailwind classes that work with the theme system
 */
export function getStatusBadgeClass(
  entityType: keyof typeof statusColorMap,
  status: string
): string {
  const colorKey = statusColorMap[entityType]?.[status as keyof typeof statusColorMap[typeof entityType]];
  
  if (!colorKey) {
    return 'bg-status-neutral-bg/10 text-status-neutral-text';
  }
  
  // Map color keys to Tailwind class names
  const colorClassMap: Record<string, string> = {
    success: 'bg-status-success-bg/10 text-status-success-text',
    warning: 'bg-status-warning-bg/10 text-status-warning-text',
    error: 'bg-status-error-bg/10 text-status-error-text',
    info: 'bg-status-info-bg/10 text-status-info-text',
    neutral: 'bg-status-neutral-bg/10 text-status-neutral-text',
  };
  
  return colorClassMap[colorKey] || colorClassMap.neutral;
}
