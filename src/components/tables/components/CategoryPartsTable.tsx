import { useState, useMemo, useEffect, type ReactNode } from "react";
import { Part } from "@/types";
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
import { getPartStatusClass } from "@/theme/utils";
import { getPartsByIds } from "@/api/parts";

interface CategoryPartsTableProps {
  parts: Part[];
  categories: Category[];
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

export function CategoryPartsTable({
  parts,
  categories,
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
  const [childPartsCache, setChildPartsCache] = useState<
    Record<string, Part[]>
  >({});

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

  // Use generic findCategoryById helper, but adapt it for CategoryData structure
  const findCategoryDataById = (
    data: CategoryData[],
    id: number
  ): CategoryData | undefined => {
    // Since CategoryData wraps Category, we can use findCategoryById on the category property
    // But we need to return CategoryData, so we search manually
    for (const item of data) {
      if (item.category.id === id) return item;
      if (item.subcategories && item.subcategories.length > 0) {
        const found = findCategoryDataById(item.subcategories, id);
        if (found) return found;
      }
    }
    return undefined;
  };

  // Get category and all descendant IDs from CategoryData structure
  const getCategoryAndDescendantIds = (data: CategoryData): number[] => {
    const ids: number[] = [data.category.id];
    // Recursively get from subcategories (CategoryData structure)
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

  // Get sold units for a part (from backend)
  const getPartSoldUnits = (part: Part): number => {
    return part.analysisStatusCounts?.sold ?? 0;
  };

  // Helper to get localized status name
  const getLocalizedStatusName = (part: Part) => {
    if (!backendFilters?.parts?.statuses || part.statusId === undefined) {
      return part.status;
    }

    const statuses = backendFilters.parts.statuses;
    if (Array.isArray(statuses)) {
      const statusOption = statuses.find((s: any) => s.rrr_id == part.statusId);
      if (statusOption) {
        return getLocalizedText(statusOption.languages, statusOption.name);
      }
    }
    return part.status;
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
        if (part.statusId === 0) {
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

  // Fetch child parts for parts that have expandable children
  useEffect(() => {
    const fetchChildParts = async () => {
      // Filter parts that have more than 1 item in part_ids
      // (single item = the parent itself, no need to fetch)
      const partsWithChildren = parts.filter(
        (part) =>
          part.part_ids &&
          Array.isArray(part.part_ids) &&
          part.part_ids.length > 1
      );

      for (const part of partsWithChildren) {
        const partKey = part.id;
        // Skip if already cached
        if (childPartsCache[partKey]) continue;

        // Get all child IDs except the first one (which is the parent)
        const childIds = part.part_ids!.slice(1);
        if (childIds.length === 0) continue;

        try {
          const childParts = await getPartsByIds(childIds, backendFilters);
          setChildPartsCache((prev) => ({
            ...prev,
            [partKey]: childParts,
          }));
        } catch (error) {
          console.error(`Error fetching child parts for ${partKey}:`, error);
        }
      }
    };

    if (parts.length > 0) {
      fetchChildParts();
    }
  }, [parts, childPartsCache, backendFilters]);

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
      </TableRow>
    );

    // Expanded: show parts and subcategories
    if (isExpanded) {
      // Show parts in this category
      parts.forEach((part: any) => {
        const partSoldUnits = getPartSoldUnits(part);
        const isPartSelected = selectedParts.has(part.id);
        const partKey = part.id;
        const childParts = childPartsCache[partKey] || [];

        // Render parent part
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
              {part.part_id ?? part.code}{" "}
              {part.manufacturerCode ? `/ ${part.manufacturerCode}` : ""}
            </TableCell>
            <TableCell className="text-center">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getPartStatusClass(
                  part.statusId
                )}`}
              >
                {getLocalizedStatusName(part)}
              </span>
            </TableCell>
            <TableCell className="text-center">
              {part.daysInInventory}
            </TableCell>
            <TableCell className="text-center">
              {part.statusId === 0 ? "1" : "0"}
            </TableCell>
            <TableCell className="text-center">{partSoldUnits}</TableCell>
            <TableCell className="text-center">{part.priceEUR} €</TableCell>
          </TableRow>
        );

        // Render child parts if they exist
        childParts.forEach((childPart) => {
          const childSoldUnits = getPartSoldUnits(childPart);
          const isChildSelected = selectedParts.has(childPart.id);
          rows.push(
            <TableRow
              key={`child-part-${childPart.id}`}
              className={cn("bg-muted/50", isChildSelected && "bg-accent")}
            >
              <TableCell style={{ paddingLeft: `${40 + level * 24}px` }}>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`child-part-${childPart.id}`}
                    checked={isChildSelected}
                    onChange={() => togglePartSelection(childPart.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-shrink-0"
                  />
                  <span className="text-sm text-muted-foreground">
                    {childPart.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-center text-sm">
                {childPart.part_id ?? childPart.code}{" "}
                {childPart.manufacturerCode
                  ? `/ ${childPart.manufacturerCode}`
                  : ""}
              </TableCell>
              <TableCell className="text-center">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPartStatusClass(
                    childPart.statusId
                  )}`}
                >
                  {getLocalizedStatusName(childPart)}
                </span>
              </TableCell>
              <TableCell className="text-center">
                {childPart.daysInInventory}
              </TableCell>
              <TableCell className="text-center">
                {childPart.statusId === 0 ? "1" : "0"}
              </TableCell>
              <TableCell className="text-center">{childSoldUnits}</TableCell>
              <TableCell className="text-center">
                {childPart.priceEUR} €
              </TableCell>
            </TableRow>
          );
        });
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
