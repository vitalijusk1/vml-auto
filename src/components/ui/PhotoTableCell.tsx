import { cn } from "@/lib/utils";

interface PhotoTableCellProps {
  src: string | string[];
  alt: string;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-20 h-20",
};

export function PhotoTableCell({
  src,
  alt,
  onClick,
  size = "md",
  className,
}: PhotoTableCellProps) {
  // Handle both string and array of photos
  const imageSrc = Array.isArray(src) ? src[0] || "" : src;

  const imageElement = (
    <img
      src={imageSrc}
      alt={alt}
      className={cn(
        sizeClasses[size],
        "object-cover rounded",
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
    />
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="cursor-pointer hover:opacity-80 transition-opacity"
      >
        {imageElement}
      </button>
    );
  }

  return imageElement;
}

