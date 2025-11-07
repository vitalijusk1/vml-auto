import { Part } from "@/types";
import { format } from "date-fns";
import { Calendar, DollarSign, Package, Car, Info } from "lucide-react";
import { PhotoGallery } from "./PhotoGallery";

interface PartDetailContentProps {
  part: Part;
  onClose: () => void;
}

export function PartDetailContent({ part }: PartDetailContentProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      {/* Photo Gallery */}
      <PhotoGallery
        photos={part.photos}
        title="Photos"
        altPrefix={`${part.name} - Photo`}
      />

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
        </div>
      </div>

      {/* Car Information */}
      <div>
        <h3 className="font-semibold mb-2">Car Information</h3>
        <div className="flex items-center gap-2 mb-2">
          <Car className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <strong>
              {part.carBrand} {part.carModel}
            </strong>
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Year: {part.carYear}
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h3 className="font-semibold mb-2">Pricing</h3>
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="text-lg font-bold">
            €{part.priceEUR.toLocaleString()}
          </span>
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
            <strong>Date Added:</strong>{" "}
            {format(part.dateAdded, "MMM dd, yyyy")}
          </span>
        </div>
        <div className="text-sm">
          <strong>Days in Inventory:</strong> {part.daysInInventory} days
        </div>
        {part.dateSold && (
          <div className="text-sm mt-2">
            <strong>Date Sold:</strong> {format(part.dateSold, "MMM dd, yyyy")}
          </div>
        )}
      </div>
    </div>
  );
}
