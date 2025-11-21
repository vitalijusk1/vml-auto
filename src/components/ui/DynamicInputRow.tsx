import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DynamicInputRowProps {
  children: React.ReactNode;
  className?: string;
  gap?: number;
  maxPerRow?: number;
}

/**
 * Dynamically distributes inputs into rows with equal spacing.
 * Responsive breakpoints:
 * - 1180px and above: max 4 per row
 * - 1024px-1179px: max 3 per row
 * - 768px-1023px: max 2 per row
 * - below 768px: max 1 per row
 * Inputs in each row are distributed equally (e.g., 2 inputs = 50% each, 3 inputs = 33.33% each).
 */
export function DynamicInputRow({
  children,
  className,
  gap = 4,
  maxPerRow: propMaxPerRow,
}: DynamicInputRowProps) {
  const [maxPerRow, setMaxPerRow] = useState(propMaxPerRow || 4);

  useEffect(() => {
    // If maxPerRow is explicitly provided, use it and don't make it responsive
    if (propMaxPerRow !== undefined) {
      setMaxPerRow(propMaxPerRow);
      return;
    }

    // Responsive breakpoints based on screen width
    const updateMaxPerRow = () => {
      const width = window.innerWidth;
      if (width >= 1180) {
        setMaxPerRow(4); // 1180px and above: max 4 per row
      } else if (width >= 1024) {
        setMaxPerRow(3); // 1024px-1179px: max 3 per row
      } else if (width >= 768) {
        setMaxPerRow(2); // 768px-1023px: max 2 per row
      } else {
        setMaxPerRow(1); // below 768px: max 1 per row
      }
    };

    // Set initial value
    updateMaxPerRow();

    // Add resize listener
    window.addEventListener("resize", updateMaxPerRow);
    return () => window.removeEventListener("resize", updateMaxPerRow);
  }, [propMaxPerRow]);

  // Filter out null/undefined children
  const validChildren = React.Children.toArray(children).filter(
    (child) => child !== null && child !== undefined
  );

  if (validChildren.length === 0) {
    return null;
  }

  // Group children into rows with maxPerRow items per row
  const rows: React.ReactNode[][] = [];
  for (let i = 0; i < validChildren.length; i += maxPerRow) {
    rows.push(validChildren.slice(i, i + maxPerRow));
  }

  return (
    <div className={cn("space-y-4", className)}>
      {rows.map((row, rowIndex) => {
        const itemsInRow = row.length;
        // Use CSS Grid with dynamic columns - each item gets equal space
        const gridTemplateColumns = `repeat(${itemsInRow}, 1fr)`;

        return (
          <div
            key={rowIndex}
            className="grid"
            style={{
              gridTemplateColumns,
              gap: `${gap * 0.25}rem`,
            }}
          >
            {row.map((child, childIndex) => (
              <div key={childIndex}>{child}</div>
            ))}
          </div>
        );
      })}
    </div>
  );
}


















