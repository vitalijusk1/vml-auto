import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Car, Part } from "@/types";
import { CarDetailContent } from "./components/CarDetailContent";
import { PhotoGallery } from "./components/PhotoGallery";
import { LayoutType } from "../filters/type";

type DetailModalType = Exclude<LayoutType, "analytics">;

interface DetailModalProps {
  type: DetailModalType;
  item: Car | Part | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DetailModal({ type, item, isOpen, onClose }: DetailModalProps) {
  if (!item) return null;

  const getTitle = () => {
    switch (type) {
      case LayoutType.CAR:
        return `${(item as Car).brand} ${(item as Car).model.name}`;
      case LayoutType.PARTS:
        return (item as Part).name;
      default:
        return "";
    }
  };

  const getContent = () => {
    switch (type) {
      case LayoutType.CAR:
        return <CarDetailContent car={item as Car} onClose={onClose} />;
      case LayoutType.PARTS:
        // For parts, only show the photo gallery
        return (
          <div className="mt-4">
            <PhotoGallery
              photos={(item as Part).photos}
              title="Nuotraukos"
              altPrefix={`${(item as Part).name} - Nuotrauka`}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>
        {getContent()}
      </DialogContent>
    </Dialog>
  );
}
