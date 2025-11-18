import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PhotoGallery } from "./components/PhotoGallery";

interface PhotoGalleryModalProps {
  photos: string[];
  title: string;
  isOpen: boolean;
  onClose: () => void;
  altPrefix?: string;
}

export function PhotoGalleryModal({
  photos,
  title,
  isOpen,
  onClose,
  altPrefix,
}: PhotoGalleryModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <PhotoGallery
            photos={photos}
            title="Nuotraukos"
            altPrefix={altPrefix || `${title} - Nuotrauka`}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
