import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Part } from '@/types';
import { format } from 'date-fns';
import { X, Calendar, DollarSign, Package, Car, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PartDetailModalProps {
  part: Part | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PartDetailModal({ part, isOpen, onClose }: PartDetailModalProps) {
  if (!part) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{part.name}</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          {/* Photo Gallery */}
          <div>
            <h3 className="font-semibold mb-2">Photos</h3>
            <div className="grid grid-cols-2 gap-2">
              {part.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`${part.name} - Photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>

          {/* Part Specifications */}
          <div>
            <h3 className="font-semibold mb-2">Part Specifications</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Part ID:</strong> {part.id}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Code:</strong> {part.code}
                </span>
              </div>
              {part.manufacturerCode && (
                <div className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Manufacturer Code:</strong> {part.manufacturerCode}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Category:</strong> {part.category}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Type:</strong> {part.partType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Quality:</strong> {part.quality}
                </span>
              </div>
              {part.position && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Position:</strong> {part.position}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Status:</strong> {part.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Quantity:</strong> {part.quantity}
                </span>
              </div>
            </div>
          </div>

          {/* Car Information */}
          <div>
            <h3 className="font-semibold mb-2">Car Information</h3>
            <div className="flex items-center gap-2 mb-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>{part.carBrand} {part.carModel}</strong>
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Year: {part.carYear}
            </div>
            <div className="text-sm text-muted-foreground">
              Car ID: {part.carId}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <h3 className="font-semibold mb-2">Pricing</h3>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-lg font-bold">€{part.priceEUR.toLocaleString()}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              PLN {part.pricePLN.toLocaleString()}
            </div>
          </div>

          {/* Inventory Info */}
          <div>
            <h3 className="font-semibold mb-2">Inventory Information</h3>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Date Added:</strong> {format(part.dateAdded, 'MMM dd, yyyy')}
              </span>
            </div>
            <div className="text-sm">
              <strong>Days in Inventory:</strong> {part.daysInInventory} days
            </div>
            {part.dateSold && (
              <div className="text-sm mt-2">
                <strong>Date Sold:</strong> {format(part.dateSold, 'MMM dd, yyyy')}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}





