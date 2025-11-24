import { Part } from "@/types";

/**
 * Determines if a part has expandable child parts
 * @param part - The part to check
 * @param isAnalyticsMode - Whether we're in analytics mode (top selling/least selling)
 * @returns true if the part has child parts that can be expanded
 */
export function hasExpandableChildren(
  part: Part,
  isAnalyticsMode: boolean = false
): boolean {
  // In analytics mode, don't show expandable parts as we want aggregated manufacturer data
  if (isAnalyticsMode || !part.part_ids || part.isChildPart) {
    return false;
  }

  // Filter out the current part ID to get actual child IDs
  const childIds = part.part_ids.filter((id) => id !== parseInt(part.id));
  return childIds.length > 0;
}

/**
 * Gets the child part IDs for a given part
 * @param part - The part to get child IDs for
 * @returns array of child part IDs
 */
export function getChildPartIds(part: Part): number[] {
  if (!part.part_ids) {
    return [];
  }

  // Filter out the current part ID to get actual child IDs
  return part.part_ids.filter((id) => id !== parseInt(part.id));
}
