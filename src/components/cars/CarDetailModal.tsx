import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Car } from '@/types';
import { Calendar, Car as CarIcon, Gauge, Palette, Settings, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { format } from 'date-fns';

interface CarDetailModalProps {
  car: Car | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CarDetailModal({ car, isOpen, onClose }: CarDetailModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!car) return null;

  const allPhotos = [car.photo, ...car.photo_gallery];

  const nextImage = () => {
    setSelectedImageIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const prevImage = () => {
    setSelectedImageIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{car.brand} {car.model.name}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Photo Gallery */}
          <div className="space-y-4">
            <h3 className="font-semibold mb-2">Photo Gallery</h3>
            
            {/* Main Image */}
            <div className="relative">
              <img
                src={allPhotos[selectedImageIndex]}
                alt={`${car.brand} ${car.model.name} - Photo ${selectedImageIndex + 1}`}
                className="w-full h-96 object-contain rounded-lg bg-gray-100"
              />
              {allPhotos.length > 1 && (
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
                    {selectedImageIndex + 1} / {allPhotos.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Grid */}
            {allPhotos.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allPhotos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative overflow-hidden rounded-lg border-2 ${
                      selectedImageIndex === index
                        ? 'border-primary'
                        : 'border-transparent hover:border-gray-300'
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
                    <strong>Brand:</strong> {car.brand}
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
                <div className="flex items-center gap-2">
                  <Gauge className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Mileage:</strong> {car.mileage.toLocaleString()} km
                  </span>
                </div>
              </div>
            </div>

            {/* Engine Info */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Engine Specifications
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Engine Code:</strong> {car.engine.code}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Capacity:</strong> {car.engine.capacity} cc
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Power:</strong> {car.engine.power} hp
                  </span>
                </div>
              </div>
            </div>

            {/* Fuel & Body */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CarIcon className="h-5 w-5" />
                Vehicle Details
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Fuel Type:</strong> {car.fuel.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Body Type:</strong> {car.body_type.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Wheel Drive:</strong> {car.wheel_drive.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Wheel Type:</strong> {car.wheel_type.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Gearbox Type:</strong> {car.gearbox_type.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Category:</strong> {car.category.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Color & Interior */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Color:</strong> {car.color.name}
                  </span>
                </div>
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
                <p className="text-sm text-muted-foreground">{car.defectation_notes}</p>
              </div>
            )}

            {/* Sync Info */}
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  <strong>Last Synced:</strong>{' '}
                  {format(new Date(car.last_synced_at), 'MMM dd, yyyy HH:mm')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

