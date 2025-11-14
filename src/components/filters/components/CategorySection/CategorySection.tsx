import { useState } from "react";
import { ChevronDown, ChevronRight, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CategoryTree } from "../CategoryTree/CategoryTree";
import { Category } from "@/utils/filterCars";
import { cn } from "@/lib/utils";

interface CategorySectionProps {
  categories: Category[];
  selectedCategories: number[];
  onCategoryToggle: (categoryId: number) => void;
}

export function CategorySection({
  categories,
  selectedCategories,
  onCategoryToggle,
}: CategorySectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const hasCategories = categories.length > 0;

  if (!hasCategories) {
    return null;
  }

  const hasSelection = selectedCategories.length > 0;

  return (
    <div className="space-y-3">
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "flex w-full items-center justify-between rounded-md px-2 py-1.5 transition-colors",
            hasSelection
              ? "bg-primary/10 hover:bg-primary/20 border border-primary/30"
              : "hover:bg-accent/50"
          )}
        >
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">Kategorijos</h3>
            {hasSelection && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {selectedCategories.length}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {/* Border line with 24px gap */}
        <div className="mt-6 border-t border-border" />
      </div>

      {isExpanded && (
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Ieškoti kategorijų..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Category Tree */}
          <div className="border rounded-md bg-white max-h-96 overflow-y-auto">
            <CategoryTree
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryToggle={onCategoryToggle}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      )}
    </div>
  );
}

