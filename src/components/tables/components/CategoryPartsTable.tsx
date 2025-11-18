import { useState, useMemo, useEffect, type ReactNode } from "react";
import { Part, Order, PartStatus } from "@/types";
import { Category } from "@/utils/backendFilters";
import { getLocalizedText } from "@/utils/i18n";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { getStatusBadgeClass } from "@/theme/utils";

interface CategoryPartsTableProps {
  parts: Part[];
  categories: Category[];
  orders: Order[];
  selectedCarId: string;
  backendFilters?: any;
  onSelectionChange?: (
    selectedCategories: Set<number>,
    selectedParts: Set<string>
  ) => void;
}

interface CategoryData {
  category: Category;
  parts: Part[];
  soldUnits: number;
  inStock: number;
  subcategories: CategoryData[];
}

// Helper to find status from backend filters by matching English name
const findStatusFromBackend = (
  status: PartStatus,
  backendFilters: any
): string | null => {
  const statuses = backendFilters?.parts?.statuses;
  if (!Array.isArray(statuses)) return null;

  // Map English status to find matching FilterOption
  const statusNameMap: Record<PartStatus, string> = {
    "In Stock": "In Stock",
    Reserved: "Reserved",
    Sold: "Sold",
    Returned: "Returned",
  };
  const englishName = statusNameMap[status];

  // Map to Lithuanian names for matching
  const lithuanianNameMap: Record<PartStatus, string> = {
    "In Stock": "Sandėlyje",
    Reserved: "Rezervuota",
    Sold: "Parduota",
    Returned: "Grąžinta",
  };
  const lithuanianName = lithuanianNameMap[status];

  for (const statusOption of statuses) {
    if (typeof statusOption === "string") {
      // Try matching both English and Lithuanian
      if (statusOption === englishName || statusOption === lithuanianName) {
        return statusOption;
      }
    } else if (statusOption && typeof statusOption === "object") {
      // Check if this FilterOption matches by Lithuanian or English name
      const ltName = statusOption.languages?.lt;
      const enName = statusOption.languages?.en;
      const optionName = statusOption.languages?.name || statusOption.name;

      // Match by Lithuanian first, then English, then fallback name
      if (
        ltName === lithuanianName ||
        ltName === englishName ||
        enName === englishName ||
        optionName === englishName
      ) {
        // Return localized version (prioritizes Lithuanian)
        return getLocalizedText(statusOption.languages, statusOption.name);
      }
    }
  }
  return null;
};

const getStatusLabel = (status: PartStatus, backendFilters: any): string => {
  // Try to get from backend filters first (with language support)
  const backendStatus = findStatusFromBackend(status, backendFilters);
  if (backendStatus) return backendStatus;

  // Fallback to hardcoded translations
  const statusLabels: Record<PartStatus, string> = {
    "In Stock": "Sandėlyje",
    Reserved: "Rezervuota",
    Sold: "Parduota",
    Returned: "Grąžinta",
  };
  return statusLabels[status] || status;
};

const getPartStatusClass = (status: PartStatus) => {
  const statusMap: Record<PartStatus, string> = {
    "In Stock": getStatusBadgeClass("part", "In Stock"),
    Reserved: getStatusBadgeClass("part", "Reserved"),
    Sold: getStatusBadgeClass("part", "Sold"),
    Returned: getStatusBadgeClass("part", "Returned"),
  };
  return statusMap[status] || getStatusBadgeClass("part", "Returned");
};

export function CategoryPartsTable({
  parts,
  categories,
  orders,
  selectedCarId,
  backendFilters,
  onSelectionChange,
}: CategoryPartsTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set()
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<number>>(
    new Set()
  );
  const [selectedParts, setSelectedParts] = useState<Set<string>>(new Set());

  // Helper function to collect all category IDs recursively from CategoryData
  const getAllCategoryIdsFromData = (
    categoryData: CategoryData[]
  ): number[] => {
    const ids: number[] = [];
    categoryData.forEach((data) => {
      ids.push(data.category.id);
      if (data.subcategories && data.subcategories.length > 0) {
        ids.push(...getAllCategoryIdsFromData(data.subcategories));
      }
    });
    return ids;
  };

  const findCategoryDataById = (
    data: CategoryData[],
    id: number
  ): CategoryData | undefined => {
    for (const item of data) {
      if (item.category.id === id) return item;
      if (item.subcategories && item.subcategories.length > 0) {
        const found = findCategoryDataById(item.subcategories, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  const getCategoryAndDescendantIds = (data: CategoryData): number[] => {
    const ids: number[] = [data.category.id];
    if (data.subcategories && data.subcategories.length > 0) {
      data.subcategories.forEach((sub) => {
        ids.push(...getCategoryAndDescendantIds(sub));
      });
    }
    return ids;
  };

  const getPartIdsFromCategoryData = (data: CategoryData): string[] => {
    const ids: string[] = data.parts.map((part) => part.id);
    if (data.subcategories && data.subcategories.length > 0) {
      data.subcategories.forEach((sub) => {
        ids.push(...getPartIdsFromCategoryData(sub));
      });
    }
    return ids;
  };

  // Calculate sold units for a part
  const getPartSoldUnits = (part: Part): number => {
    if (part.analysisStatusCounts) {
      return part.analysisStatusCounts.sold || 0;
    }

    let soldCount = 0;
    orders
      .filter((o) => o.status === "Delivered")
      .forEach((order) => {
        order.items.forEach((item) => {
          if (item.partId === part.id) {
            soldCount += item.quantity;
          }
        });
      });
    return soldCount;
  };

  // Build category tree with parts and sold units
  const buildCategoryTree = (
    categories: Category[],
    parts: Part[]
  ): CategoryData[] => {
    return categories.map((category) => {
      const categoryName = getLocalizedText(category.languages, category.name);

      // Find parts in this category
      const categoryParts = parts.filter(
        (part) => part.category === categoryName
      );

      // Calculate totals for this category
      let soldUnits = 0;
      let inStock = 0;

      categoryParts.forEach((part) => {
        soldUnits += getPartSoldUnits(part);
        if (part.status === "In Stock") {
          inStock += 1;
        }
      });

      // Recursively build subcategories
      const subcategories = category.subcategories
        ? buildCategoryTree(category.subcategories, parts)
        : [];

      // Add subcategory totals to parent
      subcategories.forEach((sub) => {
        soldUnits += sub.soldUnits;
        inStock += sub.inStock;
      });

      return {
        category,
        parts: categoryParts,
        soldUnits,
        inStock,
        subcategories,
      };
    });
  };

  const categoryData = useMemo(() => {
    // Show fake data if no real data - for UI preview
    const hasData =
      selectedCarId && (parts.length > 0 || categories.length > 0);
    if (!hasData) return [];

    // If no parts but we have categories, return empty structure
    if (parts.length === 0 && categories.length > 0) {
      return buildCategoryTree(categories, []);
    }

    return buildCategoryTree(categories, parts);
  }, [categories, parts, selectedCarId]);

  // Expand all categories by default when categoryData changes
  useEffect(() => {
    if (categoryData.length > 0) {
      const allCategoryIds = getAllCategoryIdsFromData(categoryData);
      setExpandedCategories(new Set(allCategoryIds));
    }
  }, [categoryData]);

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const toggleCategorySelection = (categoryId: number) => {
    const categoryNode = findCategoryDataById(categoryData, categoryId);
    const categoryIds = categoryNode
      ? getCategoryAndDescendantIds(categoryNode)
      : [categoryId];
    const partIds =
      categoryNode && categoryData.length > 0
        ? getPartIdsFromCategoryData(categoryNode)
        : [];

    setSelectedCategories((prevCategories) => {
      const nextCategories = new Set(prevCategories);
      const shouldSelect = !categoryIds.every((id) => nextCategories.has(id));

      categoryIds.forEach((id) => {
        if (shouldSelect) {
          nextCategories.add(id);
        } else {
          nextCategories.delete(id);
        }
      });

      setSelectedParts((prevParts) => {
        const nextParts = new Set(prevParts);
        partIds.forEach((id) => {
          if (shouldSelect) {
            nextParts.add(id);
          } else {
            nextParts.delete(id);
          }
        });
        return nextParts;
      });

      return nextCategories;
    });
  };

  const togglePartSelection = (partId: string) => {
    setSelectedParts((prev) => {
      const next = new Set(prev);
      if (next.has(partId)) {
        next.delete(partId);
      } else {
        next.add(partId);
      }
      return next;
    });
  };

  // Notify parent of selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedCategories, selectedParts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedParts]);

  const renderCategoryRow = (
    categoryData: CategoryData,
    level: number = 0
  ): ReactNode[] => {
    const { category, parts, soldUnits, inStock, subcategories } = categoryData;
    const categoryName = getLocalizedText(category.languages, category.name);
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategories.has(category.id);
    const hasChildren = subcategories.length > 0;

    const rows: ReactNode[] = [];

    // Main category row
    rows.push(
      <TableRow
        key={category.id}
        className={cn(
          "cursor-pointer hover:bg-accent/50",
          isSelected && "bg-accent"
        )}
      >
        <TableCell
          style={{ paddingLeft: `${16 + level * 24}px` }}
          className="font-medium"
        >
          <div className="flex items-center gap-2">
            <Checkbox
              id={`category-${category.id}`}
              checked={isSelected}
              onChange={() => toggleCategorySelection(category.id)}
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0"
            />
            {hasChildren && (
              <button
                onClick={() => toggleCategory(category.id)}
                className="p-0.5 hover:bg-accent rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            )}
            <span onClick={() => hasChildren && toggleCategory(category.id)}>
              {categoryName}
            </span>
          </div>
        </TableCell>
        <TableCell className="text-center">-</TableCell>
        <TableCell className="text-center">-</TableCell>
        <TableCell className="text-center">-</TableCell>
        <TableCell className="text-center">{inStock}</TableCell>
        <TableCell className="text-center">{soldUnits}</TableCell>
        <TableCell className="text-center">-</TableCell>
        <TableCell className="text-center">-</TableCell>
      </TableRow>
    );

    // Expanded: show parts and subcategories
    if (isExpanded) {
      // Show parts in this category
      parts.forEach((part) => {
        const partSoldUnits = getPartSoldUnits(part);
        const isPartSelected = selectedParts.has(part.id);
        rows.push(
          <TableRow
            key={`part-${part.id}`}
            className={cn("bg-muted/30", isPartSelected && "bg-accent")}
          >
            <TableCell style={{ paddingLeft: `${40 + level * 24}px` }}>
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`part-${part.id}`}
                  checked={isPartSelected}
                  onChange={() => togglePartSelection(part.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0"
                />
                <span className="text-sm text-muted-foreground">
                  {part.name}
                </span>
              </div>
            </TableCell>
            <TableCell className="text-center text-sm">
              {part.code}{" "}
              {part.manufacturerCode ? `/ ${part.manufacturerCode}` : ""}
            </TableCell>
            <TableCell className="text-center">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getPartStatusClass(
                  part.status as PartStatus
                )}`}
              >
                {getStatusLabel(part.status as PartStatus, backendFilters)}
              </span>
            </TableCell>
            <TableCell className="text-center">
              {part.daysInInventory}
            </TableCell>
            <TableCell className="text-center">
              {part.status === "In Stock" ? "1" : "0"}
            </TableCell>
            <TableCell className="text-center">{partSoldUnits}</TableCell>
            <TableCell className="text-center">{part.priceEUR} €</TableCell>
            <TableCell className="text-center">
              {part.warehouse || "-"}
            </TableCell>
          </TableRow>
        );
      });

      // Show subcategories
      subcategories.forEach((sub) => {
        rows.push(...renderCategoryRow(sub, level + 1));
      });
    }

    return rows;
  };

  if (!selectedCarId) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Pasirinkite automobilį, kad matytumėte kategorijas ir detales
      </div>
    );
  }

  if (categoryData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nerasta dalių šiam automobiliui
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-white overflow-hidden">
      <div className="relative w-full overflow-visible">
        <table className="w-full caption-bottom text-sm">
          <TableHeader className="sticky top-0 z-10 bg-background shadow-sm">
            <TableRow>
              <TableHead className="bg-background">Kategorijos</TableHead>
              <TableHead className="text-center bg-background">
                Detalės id / gamintojo kodas
              </TableHead>
              <TableHead className="text-center bg-background">
                Statusas
              </TableHead>
              <TableHead className="text-center bg-background">
                Laikas sandėly
              </TableHead>
              <TableHead className="text-center bg-background">
                Likutis
              </TableHead>
              <TableHead className="text-center bg-background">
                Parduota
              </TableHead>
              <TableHead className="text-center bg-background">Kaina</TableHead>
              <TableHead className="text-center bg-background">
                Sandėlys
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categoryData.map((data) => renderCategoryRow(data))}
          </TableBody>
        </table>
      </div>
    </div>
  );
}
