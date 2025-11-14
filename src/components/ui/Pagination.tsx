import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
}: PaginationProps) {
  const [isChanging, setIsChanging] = useState(false);
  const changeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (changeTimeoutRef.current) {
        clearTimeout(changeTimeoutRef.current);
      }
    };
  }, []);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 4) {
        // Near the beginning: 1, 2, 3, 4, 5, ..., last
        for (let i = 2; i <= 5; i++) {
          pages.push(i);
        }
        if (totalPages > 6) {
          pages.push("ellipsis");
        }
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // Near the end: 1, ..., last-4, last-3, last-2, last-1, last
        pages.push("ellipsis");
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle: 1, ..., current-1, current, current+1, ..., last
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const handlePageChange = (newPage: number) => {
    // Prevent rapid clicks
    if (isChanging || disabled) return;
    
    // Validate page number
    if (newPage < 1 || newPage > totalPages) return;
    
    // If clicking the same page, ignore
    if (newPage === currentPage) return;
    
    setIsChanging(true);
    onPageChange(newPage);
    
    // Clear any existing timeout
    if (changeTimeoutRef.current) {
      clearTimeout(changeTimeoutRef.current);
    }
    
    // Reset the changing state after a short delay
    changeTimeoutRef.current = setTimeout(() => {
      setIsChanging(false);
    }, 300);
  };

  return (
    <div className="flex items-center gap-1">
      {/* Previous Button */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={disabled || currentPage <= 1 || isChanging}
        className={cn(
          "h-9 w-9 flex items-center justify-center rounded border border-border bg-white text-foreground transition-colors",
          "hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === "ellipsis") {
          return (
            <span
              key={`ellipsis-${index}`}
              className="px-3 py-2 text-sm text-foreground"
            >
              ...
            </span>
          );
        }

        const pageNum = page as number;
        const isActive = pageNum === currentPage;

        return (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            disabled={disabled || isChanging}
            className={cn(
              "h-9 min-w-9 px-3 py-2 rounded border text-sm font-normal transition-colors",
              isActive
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-white text-foreground border-border hover:bg-accent"
            )}
          >
            {pageNum}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={disabled || currentPage >= totalPages || isChanging}
        className={cn(
          "h-9 w-9 flex items-center justify-center rounded border border-border bg-white text-foreground transition-colors",
          "hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

