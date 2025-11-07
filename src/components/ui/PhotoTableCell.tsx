import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImageOff } from "lucide-react";

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

const iconSizes = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

function PhotoTableCell({
  src,
  alt,
  onClick,
  size = "md",
  className,
}: PhotoTableCellProps) {
  const [imageError, setImageError] = useState(false);

  // Handle both string and array of photos
  const imageSrc = Array.isArray(src) ? src[0] || "" : src;
  const hasImage = imageSrc && imageSrc.trim() !== "";

  const containerClasses = cn(
    sizeClasses[size],
    "flex items-center justify-center rounded bg-muted border border-border",
    onClick && "cursor-pointer hover:opacity-80 transition-opacity",
    className
  );

  const content =
    hasImage && !imageError ? (
      <img
        src={imageSrc}
        alt={alt}
        className={cn(sizeClasses[size], "object-cover rounded")}
        onError={() => setImageError(true)}
      />
    ) : (
      <ImageOff className={cn(iconSizes[size], "text-muted-foreground")} />
    );

  if (onClick) {
    return (
      <button onClick={onClick} className={containerClasses}>
        {content}
      </button>
    );
  }

  return <div className={containerClasses}>{content}</div>;
}

export { PhotoTableCell };
