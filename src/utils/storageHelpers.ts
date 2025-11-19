import { FilterState } from "@/types";
import { defaultFilters } from "@/store/slices/filtersSlice";
import { StorageKey } from "./storageKeys";

/**
 * Loads persisted filters from sessionStorage.
 * Merges persisted filters with defaultFilters to ensure all required fields are present.
 * Returns defaultFilters if no persisted data is found or if an error occurs.
 *
 * @param storageKey - The storage key to load from (e.g., StorageKeys.PARTS_FILTERS)
 * @returns The loaded FilterState, or defaultFilters if nothing is found
 *
 * @example
 * ```tsx
 * const [filters, setFilters] = useState<FilterState>(
 *   loadPersistedFilters(StorageKeys.PARTS_FILTERS)
 * );
 * ```
 */
export function loadPersistedFilters(storageKey: StorageKey): FilterState {
  try {
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      const persistedFilters = JSON.parse(stored);
      return { ...defaultFilters, ...persistedFilters };
    }
  } catch (error) {
    console.error(`Error loading persisted filters from ${storageKey}:`, error);
  }
  return defaultFilters;
}
