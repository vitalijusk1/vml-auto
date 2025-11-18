import { OrderItem } from "@/types";

interface OrderItemExpandedContentProps {
  items: OrderItem[];
  title: string;
  onPhotoClick: (photos: string[], title: string) => void;
  showReason?: boolean;
  showQuantity?: boolean;
}

export function OrderItemExpandedContent({
  items,
  title,
  onPhotoClick,
  showReason = false,
  showQuantity = true,
}: OrderItemExpandedContentProps) {
  return (
    <div className="py-4">
      <h4 className="font-semibold text-xs mb-3">{title}</h4>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-start justify-between gap-4 p-3 bg-muted rounded-lg border border-border"
          >
            {item.photo && (
              <button
                onClick={() => {
                  const photos =
                    item.photoGallery || (item.photo ? [item.photo] : []);
                  if (photos.length > 0) {
                    onPhotoClick(photos, item.partName || "Nuotraukos");
                  }
                }}
                className="w-16 h-16 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <img
                  src={item.photo}
                  alt={item.partName}
                  className="w-16 h-16 object-cover rounded"
                />
              </button>
            )}
            {/* Part Name */}
            <div className="flex flex-col flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                {showReason ? "Prekė" : "Pavadinimas"}
              </div>
              <div className={`text-sm ${showReason ? "font-semibold" : ""}`}>
                {item.partName || "N/A"}
              </div>
            </div>
            {/* Part ID */}
            <div className="flex flex-col flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                Detalės id
              </div>
              <div className="text-sm">{item.partId || "N/A"}</div>
            </div>
            {/* Manufacturer Code - shown before car info for returns, after for orders */}
            {showReason && (
              <div className="flex flex-col flex-1">
                <div className="text-xs text-muted-foreground mb-1">
                  Gamintojo kodas
                </div>
                <div className="text-sm">
                  {(item as any).manufacturerCode ||
                    (item as any).partCode ||
                    "N/A"}
                </div>
              </div>
            )}
            {/* Car Info */}
            <div className="flex flex-col flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                Automobilis
              </div>
              <div className="text-sm">
                {item.carBrand && item.carModel ? (
                  <>
                    <div>
                      {item.carBrand} {item.carModel}
                    </div>
                    {item.carYear && (
                      <div className="text-xs text-muted-foreground">
                        {item.carYear}
                      </div>
                    )}
                  </>
                ) : (
                  <div>N/A</div>
                )}
              </div>
            </div>
            {/* Body Type */}
            <div className="flex flex-col flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                Kėbulo tipas
              </div>
              <div className="text-sm">
                {showReason
                  ? (item as any).carBodyType || "N/A"
                  : item.bodyType || "N/A"}
              </div>
            </div>
            {/* Fuel Type */}
            <div className="flex flex-col flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                Kuro tipas
              </div>
              <div className="text-sm">
                {showReason
                  ? (item as any).carFuelType || "N/A"
                  : item.fuelType || "N/A"}
              </div>
            </div>
            {/* Engine Capacity */}
            <div className="flex flex-col flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                Variklio tūris
              </div>
              <div className="text-sm">
                {showReason
                  ? (item as any).carEngineCapacity
                    ? `${(item as any).carEngineCapacity}L`
                    : "N/A"
                  : item.engineCapacity
                  ? `${item.engineCapacity}cc`
                  : "N/A"}
              </div>
            </div>
            {/* Manufacturer Code - shown after car info for orders */}
            {!showReason && (
              <div className="flex flex-col flex-1">
                <div className="text-xs text-muted-foreground mb-1">
                  Gamintojo kodas
                </div>
                <div className="text-sm">{item.manufacturerCode || "N/A"}</div>
              </div>
            )}
            {/* Reason - only for returns */}
            {showReason && (
              <div className="flex flex-col flex-1">
                <div className="text-xs text-muted-foreground mb-1">
                  Priežastis
                </div>
                <div className="text-sm">{(item as any).reason || "N/A"}</div>
              </div>
            )}
            <div className="flex flex-col flex-shrink-0 flex-1 text-right">
              <div className="text-xs text-muted-foreground mb-1">Kaina</div>
              <div className="text-sm">
                €
                {showReason
                  ? ((item as any).price || 0).toLocaleString()
                  : (item.priceEUR || 0).toLocaleString()}
              </div>
              {showQuantity && item.quantity > 1 && (
                <>
                  <div className="text-xs text-muted-foreground mt-1">
                    Kiekis
                  </div>
                  <div className="text-sm">{item.quantity}</div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
