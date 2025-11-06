import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PhotoGalleryProps {
  photos: string[];
  title?: string;
  altPrefix?: string;
}

export function PhotoGallery({ photos, title = "Photos", altPrefix = "Photo" }: PhotoGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div>
        <h3 className="font-semibold mb-2">{title}</h3>
        <div className="text-sm text-muted-foreground">No photos available</div>
      </div>
    );
  }

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % photos.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold mb-2">{title}</h3>
      
      {/* Main Image */}
      <div className="relative">
        <img
          src={photos[selectedImageIndex]}
          alt={`${altPrefix} ${selectedImageIndex + 1}`}
          className="w-full h-96 object-contain rounded-lg bg-gray-100"
        />
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
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative overflow-hidden rounded-lg border-2 ${
                selectedImageIndex === index
                  ? "border-primary"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img
                src={photo}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-20 object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

