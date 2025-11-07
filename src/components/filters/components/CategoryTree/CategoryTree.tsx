import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Category } from "@/utils/filterCars";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CategoryTreeProps {
  categories: Category[];
  selectedCategories: number[];
  onCategoryToggle: (categoryId: number) => void;
  level?: number;
  searchQuery?: string;
}

// Helper function to filter categories recursively based on search query
function filterCategories(
  categories: Category[],
  searchQuery: string
): Category[] {
  if (!searchQuery.trim()) return categories;

  const query = searchQuery.toLowerCase();
  return categories
    .map((category) => {
      const displayName =
        category.languages?.en || category.languages?.name || category.name;
      const matchesSearch = displayName.toLowerCase().includes(query);

      // Filter subcategories recursively
      const filteredSubcategories = filterCategories(
        category.subcategories,
        searchQuery
      );

      // Include category if it matches or has matching subcategories
      if (matchesSearch || filteredSubcategories.length > 0) {
        return {
          ...category,
          subcategories: filteredSubcategories,
        };
      }
      return null;
    })
    .filter((category): category is Category => category !== null);
}

export function CategoryTree({
  categories,
  selectedCategories,
  onCategoryToggle,
  level = 0,
  searchQuery = "",
}: CategoryTreeProps) {
  const filteredCategories = useMemo(() => {
    return filterCategories(categories, searchQuery);
  }, [categories, searchQuery]);

  return (
    <div className={cn("space-y-0.5", level > 0 && "ml-4 mt-1 border-l border-border pl-3")}>
      {filteredCategories.map((category) => (
        <CategoryItem
          key={category.id}
          category={category}
          selectedCategories={selectedCategories}
          onCategoryToggle={onCategoryToggle}
          level={level}
        />
      ))}
    </div>
  );
}

interface CategoryItemProps {
  category: Category;
  selectedCategories: number[];
  onCategoryToggle: (categoryId: number) => void;
  level: number;
}

function CategoryItem({
  category,
  selectedCategories,
  onCategoryToggle,
  level,
}: CategoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false); // Not expanded by default
  const hasChildren = category.subcategories && category.subcategories.length > 0;
  const isSelected = selectedCategories.includes(category.id);

  // Get display name (prefer English, fallback to name)
  const displayName =
    category.languages?.en || category.languages?.name || category.name;

  return (
    <div className="space-y-0.5">
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-accent/50 transition-colors group",
          isSelected && "bg-accent",
          level === 0 && "font-medium text-foreground",
          level === 1 && "text-sm text-foreground/90",
          level === 2 && "text-sm text-muted-foreground"
        )}
      >
        {hasChildren ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 hover:bg-accent rounded transition-colors flex-shrink-0"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            )}
          </button>
        ) : (
          <div className="w-5 flex-shrink-0" /> // Spacer for alignment
        )}

        <Checkbox
          id={`category-${category.id}`}
          checked={isSelected}
          onChange={() => onCategoryToggle(category.id)}
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        />

        <label
          htmlFor={`category-${category.id}`}
          className="flex-1 cursor-pointer select-none py-0.5"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // If has children, toggle expansion; otherwise toggle selection
            if (hasChildren) {
              setIsExpanded(!isExpanded);
            } else {
              onCategoryToggle(category.id);
            }
          }}
        >
          {displayName}
        </label>
      </div>

      {hasChildren && isExpanded && (
        <CategoryTree
          categories={category.subcategories}
          selectedCategories={selectedCategories}
          onCategoryToggle={onCategoryToggle}
          level={level + 1}
        />
      )}
    </div>
  );
}

