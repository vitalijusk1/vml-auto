import { Car } from "@/types";
import {
  Calendar,
  Car as CarIcon,
  Gauge,
  Palette,
  Settings,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { PhotoGallery } from "./PhotoGallery";

interface CarDetailContentProps {
  car: Car;
  onClose: () => void;
}

export function CarDetailContent({ car }: CarDetailContentProps) {
  const allPhotos = [
    ...(car.photo ? [car.photo] : []),
    ...car.photo_gallery.filter((photo): photo is string => photo !== null),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      {/* Photo Gallery */}
      <PhotoGallery
        photos={allPhotos}
        title="Photo Gallery"
        altPrefix={`${car.brand.name} ${car.model.name} - Photo`}
      />

      {/* Car Details */}
      <div className="space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CarIcon className="h-5 w-5" />
            Basic Information
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Car ID:</strong> {car.id}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Brand:</strong> {car.brand.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Model:</strong> {car.model.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Year:</strong> {car.year}
              </span>
            </div>
            {car.model_year && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Model Year:</strong> {car.model_year}
                </span>
              </div>
            )}
            {car.mileage !== null && (
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Mileage:</strong> {car.mileage.toLocaleString()} km
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Engine Info */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Engine Specifications
          </h3>
          <div className="space-y-2">
            {car.engine.code && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Engine Code:</strong> {car.engine.code}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Capacity:</strong> {car.engine.capacity} cc
              </span>
            </div>
            {car.engine.power !== null && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Power:</strong> {car.engine.power} hp
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Fuel & Body */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <CarIcon className="h-5 w-5" />
            Vehicle Details
          </h3>
          <div className="space-y-2">
            {car.fuel && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Fuel Type:</strong> {car.fuel.name}
                </span>
              </div>
            )}
            {car.body_type && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Body Type:</strong> {car.body_type.name}
                </span>
              </div>
            )}
            {car.wheel_drive && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Wheel Drive:</strong> {car.wheel_drive.name}
                </span>
              </div>
            )}
            {car.wheel_type && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Wheel Type:</strong> {car.wheel_type.name}
                </span>
              </div>
            )}
            {car.gearbox_type && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Gearbox Type:</strong> {car.gearbox_type.name}
                </span>
              </div>
            )}
            {car.category && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Category:</strong> {car.category.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Color & Interior */}
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </h3>
          <div className="space-y-2">
            {car.color && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Color:</strong> {car.color.name}
                </span>
              </div>
            )}
            {car.color_code && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Color Code:</strong> {car.color_code}
                </span>
              </div>
            )}
            {car.interior && (
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Interior:</strong> {car.interior}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info */}
        {car.defectation_notes && (
          <div>
            <h3 className="font-semibold mb-3">Defectation Notes</h3>
            <p className="text-sm text-muted-foreground">
              {car.defectation_notes}
            </p>
          </div>
        )}

        {/* Sync Info */}
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              <strong>Last Synced:</strong>{" "}
              {format(new Date(car.last_synced_at), "MMM dd, yyyy HH:mm")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
