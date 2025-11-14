import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Category } from "@/utils/filterCars";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { getLocalizedText } from "@/utils/i18n";

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
      const displayName = getLocalizedText(category.languages, category.name);
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
    <div className="space-y-0">
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

  // Get display name (prefer Lithuanian, fallback to English, then name)
  const displayName = getLocalizedText(category.languages, category.name);

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 hover:bg-accent/50 transition-colors",
          isSelected && "bg-accent"
        )}
        style={{ paddingLeft: level > 0 ? `${8 + level * 16}px` : "8px" }}
      >
        <Checkbox
          id={`category-${category.id}`}
          checked={isSelected}
          onChange={() => onCategoryToggle(category.id)}
          className="flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        />

        <div
          className={cn(
            "flex-1 cursor-pointer select-none text-sm",
            hasChildren ? "text-foreground" : "text-muted-foreground"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (hasChildren) {
              setIsExpanded(!isExpanded);
            } else {
              // If no children, clicking text selects the category
              onCategoryToggle(category.id);
            }
          }}
        >
          {displayName}
        </div>

        {hasChildren && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 hover:bg-accent rounded transition-colors flex-shrink-0 ml-auto"
            aria-label={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        )}
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

