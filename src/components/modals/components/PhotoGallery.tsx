import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

interface PhotoGalleryProps {
  photos: string[];
  title?: string;
  altPrefix?: string;
}

interface ThumbnailButtonProps {
  photo: string;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

function ThumbnailButton({
  photo,
  index,
  isSelected,
  onClick,
}: ThumbnailButtonProps) {
  const [imageError, setImageError] = useState(false);
  const hasPhoto = photo && photo.trim() !== "";

  return (
    <button
      onClick={onClick}
      className={`relative overflow-hidden rounded-lg border-2 ${
        isSelected
          ? "border-primary"
          : "border-transparent hover:border-gray-300"
      }`}
    >
      {hasPhoto && !imageError ? (
        <img
          src={photo}
          alt={`Thumbnail ${index + 1}`}
          className="w-full h-20 object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-20 flex items-center justify-center bg-muted">
          <ImageOff className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
    </button>
  );
}

export function PhotoGallery({
  photos,
  title = "Photos",
  altPrefix = "Photo",
}: PhotoGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  if (photos.length === 0) {
    return (
      <div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="flex flex-col items-center justify-center h-96 bg-muted rounded-lg border border-border">
          <ImageOff className="h-16 w-16 text-muted-foreground mb-2" />
          <div className="text-sm text-muted-foreground">
            No photos available
          </div>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % photos.length);
    setImageError(false);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setImageError(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-2">{title}</h3>

      {/* Main Image */}
      <div className="relative">
        {imageError ? (
          <div className="w-full h-96 flex flex-col items-center justify-center bg-muted rounded-lg border border-border">
            <ImageOff className="h-16 w-16 text-muted-foreground mb-2" />
            <div className="text-sm text-muted-foreground">
              Photo unavailable
            </div>
          </div>
        ) : (
          <img
            src={photos[selectedImageIndex]}
            alt={`${altPrefix} ${selectedImageIndex + 1}`}
            className="w-full h-96 object-contain rounded-lg bg-gray-100"
            onError={() => setImageError(true)}
            onLoad={() => setImageError(false)}
          />
        )}
        {photos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={prevImage}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
              onClick={nextImage}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {selectedImageIndex + 1} / {photos.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Grid */}
      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo, index) => (
            <ThumbnailButton
              key={index}
              photo={photo}
              index={index}
              isSelected={selectedImageIndex === index}
              onClick={() => {
                setSelectedImageIndex(index);
                setImageError(false);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
