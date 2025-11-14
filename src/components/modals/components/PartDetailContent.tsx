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
        title="Nuotraukos"
        altPrefix={`${part.name} - Nuotrauka`}
      />

      {/* Part Specifications */}
      <div>
        <h3 className="font-semibold mb-2">Dalies specifikacijos</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>Dalies ID:</strong> {part.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>Kodas:</strong> {part.code}
            </span>
          </div>
          {part.manufacturerCode && (
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Gamintojo kodas:</strong> {part.manufacturerCode}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>Kategorija:</strong> {part.category}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>Tipas:</strong> {part.partType}
            </span>
          </div>
          {part.position && (
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                <strong>Padėtis:</strong> {part.position}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>Būsena:</strong> {part.status}
            </span>
          </div>
        </div>
      </div>

      {/* Car Information */}
      <div>
        <h3 className="font-semibold mb-2">Automobilio informacija</h3>
        <div className="flex items-center gap-2 mb-2">
          <Car className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <strong>
              {part.carBrand} {part.carModel}
            </strong>
          </span>
        </div>
        <div className="text-sm text-muted-foreground">
          Metai: {part.carYear}
        </div>
      </div>

      {/* Pricing */}
      <div>
        <h3 className="font-semibold mb-2">Kainos</h3>
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
        <h3 className="font-semibold mb-2">Inventoriaus informacija</h3>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            <strong>Pridėta data:</strong>{" "}
            {(() => {
              try {
                const date = part.dateAdded;
                if (!date) return "-";
                const dateObj = date instanceof Date ? date : new Date(date);
                if (isNaN(dateObj.getTime())) return "-";
                return format(dateObj, "MMM dd, yyyy");
              } catch (error) {
                console.error(
                  "Error formatting dateAdded:",
                  error,
                  part.dateAdded
                );
                return "-";
              }
            })()}
          </span>
        </div>
        <div className="text-sm">
          <strong>Dienos sandėlyje:</strong> {part.daysInInventory} d.
        </div>
        {part.dateSold && (
          <div className="text-sm mt-2">
            <strong>Pardavimo data:</strong>{" "}
            {(() => {
              try {
                const date = part.dateSold;
                if (!date) return "-";
                const dateObj = date instanceof Date ? date : new Date(date);
                if (isNaN(dateObj.getTime())) return "-";
                return format(dateObj, "MMM dd, yyyy");
              } catch (error) {
                console.error(
                  "Error formatting dateSold:",
                  error,
                  part.dateSold
                );
                return "-";
              }
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
