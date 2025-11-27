import { useState, useMemo, useEffect } from "react";
import { Part, TopDetailsFilter } from "@/types";
import { getPartsByIds } from "@/api/parts";

interface UseFetchedPartsReturn {
  parts: Part[];
  isLoading: boolean;
}

/**
 * Hook to fetch all parts from part_list via /parts API.
 * All parts are now equal - no parent/child relationship.
 */
export function useFetchedParts(
  parts: Part[],
  topDetailsFilter?: TopDetailsFilter,
  backendFilters?: any
): UseFetchedPartsReturn {
  const [allPartsFromApi, setAllPartsFromApi] = useState<Part[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isAnalyticsMode =
    topDetailsFilter === TopDetailsFilter.TOP_SELLING ||
    topDetailsFilter === TopDetailsFilter.LEAST_SELLING;

  // Fetch ALL parts from part_list via /parts API
  useEffect(() => {
    const fetchAllParts = async () => {
      // In analytics mode, don't fetch - use original parts
      if (isAnalyticsMode) {
        setAllPartsFromApi([]);
        return;
      }

      // Collect all unique part IDs from all parts' part_ids
      const allPartIds = new Set<number>();
      parts.forEach((part) => {
        if (part.part_ids && Array.isArray(part.part_ids)) {
          part.part_ids.forEach((id) => allPartIds.add(id));
        }
      });

      if (allPartIds.size === 0) {
        setAllPartsFromApi([]);
        return;
      }

      setIsLoading(true);
      try {
        const fetchedParts = await getPartsByIds(
          Array.from(allPartIds),
          backendFilters
        );
        setAllPartsFromApi(fetchedParts);
      } catch (error) {
        console.error("Error fetching parts from API:", error);
        setAllPartsFromApi([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (parts.length > 0) {
      fetchAllParts();
    } else {
      setAllPartsFromApi([]);
    }
  }, [parts, backendFilters, isAnalyticsMode]);

  // Return fetched parts or original parts in analytics mode
  const processedParts = useMemo(() => {
    if (isAnalyticsMode) {
      return parts;
    }
    // Return fetched parts if available, otherwise return original parts as fallback
    return allPartsFromApi.length > 0 ? allPartsFromApi : parts;
  }, [parts, allPartsFromApi, isAnalyticsMode]);

  return {
    parts: processedParts,
    isLoading,
  };
}
