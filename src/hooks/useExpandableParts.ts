import { useState, useCallback, useMemo, useEffect } from "react";
import { Part, TopDetailsFilter } from "@/types";
import { getPartsByIds } from "@/api/parts";
import { hasExpandableChildren, getChildPartIds } from "@/utils/partHelpers";

interface UseExpandablePartsReturn {
  expandedRows: Set<string>;
  processedParts: Part[];
  toggleExpand: (partId: string) => void;
}

export function useExpandableParts(
  parts: Part[],
  topDetailsFilter?: TopDetailsFilter
): UseExpandablePartsReturn {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [childPartsCache, setChildPartsCache] = useState<
    Record<string, Part[]>
  >({});
  const [loadingChildParts, setLoadingChildParts] = useState<Set<string>>(
    new Set()
  );

  const isAnalyticsMode =
    topDetailsFilter === TopDetailsFilter.TOP_SELLING ||
    topDetailsFilter === TopDetailsFilter.LEAST_SELLING;

  const toggleExpand = useCallback(
    async (partId: string) => {
      const part = parts.find((p) => p.id === partId);
      if (!part || !hasExpandableChildren(part, isAnalyticsMode)) {
        return;
      }

      setExpandedRows((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(partId)) {
          // Collapsing
          newSet.delete(partId);
        } else {
          // Expanding - need to fetch child parts if not cached
          newSet.add(partId);

          if (!childPartsCache[partId] && !loadingChildParts.has(partId)) {
            setLoadingChildParts((prev) => new Set(prev.add(partId)));

            // Get child part IDs
            const childIds = getChildPartIds(part);

            if (childIds.length > 0) {
              getPartsByIds(childIds)
                .then((childParts) => {
                  // Mark child parts and set parent reference
                  const processedChildParts = childParts.map((childPart) => ({
                    ...childPart,
                    isChildPart: true,
                    parentPartId: partId,
                  }));

                  setChildPartsCache((prev) => ({
                    ...prev,
                    [partId]: processedChildParts,
                  }));
                })
                .catch((error) => {
                  console.error("Failed to fetch child parts:", error);
                })
                .finally(() => {
                  setLoadingChildParts((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(partId);
                    return newSet;
                  });
                });
            }
          }
        }
        return newSet;
      });
    },
    [parts, childPartsCache, loadingChildParts, isAnalyticsMode]
  );

  // Process parts to include child parts when expanded
  const processedParts = useMemo(() => {
    const result: Part[] = [];

    parts.forEach((part) => {
      // Add the main part
      result.push(part);

      // Add child parts if expanded and cached
      if (expandedRows.has(part.id) && childPartsCache[part.id]) {
        result.push(...childPartsCache[part.id]);
      }
    });

    return result;
  }, [parts, expandedRows, childPartsCache]);

  // Auto-expand parts that have part_ids by default
  // Only run when parts data actually changes (after filter applied), not when mode changes
  useEffect(() => {
    // Don't auto-expand in analytics mode
    if (isAnalyticsMode) {
      setExpandedRows(new Set());
      return;
    }

    const defaultExpanded = new Set<string>();
    parts.forEach((part) => {
      if (hasExpandableChildren(part, isAnalyticsMode) && part.isExpanded) {
        defaultExpanded.add(part.id);

        // Auto-fetch child parts for default expanded items
        const childIds = getChildPartIds(part);
        if (childIds.length > 0) {
          getPartsByIds(childIds)
            .then((childParts) => {
              const processedChildParts = childParts.map((childPart) => ({
                ...childPart,
                isChildPart: true,
                parentPartId: part.id,
              }));

              setChildPartsCache((prev) => ({
                ...prev,
                [part.id]: processedChildParts,
              }));
            })
            .catch((error) => {
              console.error(
                "Failed to fetch child parts for auto-expand:",
                error
              );
            });
        }
      }
    });

    if (defaultExpanded.size > 0) {
      setExpandedRows(defaultExpanded);
    }
  }, [parts]);

  // Handle mode changes - clear expansion when entering analytics mode
  useEffect(() => {
    if (isAnalyticsMode) {
      setExpandedRows(new Set());
      setChildPartsCache({});
    }
  }, [isAnalyticsMode]);

  return {
    expandedRows,
    processedParts,
    toggleExpand,
  };
}
