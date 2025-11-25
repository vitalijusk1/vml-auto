import { useState, useEffect } from "react";

/**
 * Hook to detect if the current viewport is mobile-sized.
 * Uses the Tailwind md breakpoint (768px) as the threshold.
 *
 * @param breakpoint - The pixel width threshold (default: 768 for md breakpoint)
 * @returns boolean indicating if viewport width is below the breakpoint
 *
 * @example
 * ```tsx
 * const isMobile = useIsMobile();
 * // or with custom breakpoint
 * const isSmall = useIsMobile(640); // sm breakpoint
 * ```
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    // Check on mount
    checkMobile();

    // Listen for resize events
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  return isMobile;
}
