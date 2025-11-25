import { OrderItem } from "@/types";

interface OrderItemExpandedContentProps {
  items: OrderItem[];
  title: string;
  onPhotoClick: (photos: string[], title: string) => void;
  showReason?: boolean;
  showQuantity?: boolean;
  isMobile?: boolean;
}

export function OrderItemExpandedContent({
  items,
  title,
  onPhotoClick,
  showReason = false,
  showQuantity = true,
  isMobile = false,
}: OrderItemExpandedContentProps) {
  // Mobile layout (compact)
  if (isMobile) {
    return (
      <div className="py-4">
        <h4 className="font-semibold text-xs mb-3">{title}</h4>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-muted rounded-lg border border-border"
            >
              <div className="flex items-start gap-3">
                {item.photo && (
                  <button
                    onClick={() => {
                      const photos =
                        item.photoGallery || (item.photo ? [item.photo] : []);
                      if (photos.length > 0) {
                        onPhotoClick(photos, item.partName || "Nuotraukos");
                      }
                    }}
                    className="w-12 h-12 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={item.photo}
                      alt={item.partName}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </button>
                )}

                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm mb-1">
                    {item.partName || "-"}
                  </div>
                  <div className="text-xs text-muted-foreground mb-1">
                    ID: {item.partId || "-"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.carBrand && item.carModel
                      ? `${item.carBrand} ${item.carModel} ${
                          item.carYear ? `(${item.carYear})` : ""
                        }`
                      : "-"}
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="text-xs text-muted-foreground">Kaina</div>
                  <div className="font-medium text-sm">
                    €
                    {showReason
                      ? ((item as any).price || 0).toLocaleString()
                      : (item.priceEUR || 0).toLocaleString()}
                  </div>
                  {showQuantity && item.quantity > 1 && (
                    <div className="mt-1">
                      <div className="text-xs text-muted-foreground">
                        Kiekis
                      </div>
                      <div className="text-sm">{item.quantity}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-border/50">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <div className="text-muted-foreground">Gamintojo kodas</div>
                    <div className="truncate">
                      {showReason
                        ? (item as any).manufacturerCode ||
                          (item as any).partCode ||
                          "N/A"
                        : item.manufacturerCode || "-"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Kėbulo tipas</div>
                    <div className="truncate">
                      {showReason
                        ? (item as any).carBodyType || "-"
                        : item.bodyType || "-"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop layout (original horizontal layout)
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
            <div className="flex flex-col flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                {showReason ? "Prekė" : "Pavadinimas"}
              </div>
              <div className={`text-sm ${showReason ? "font-semibold" : ""}`}>
                {item.partName || "-"}
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                Detalės id
              </div>
              <div className="text-sm">{item.partId || "-"}</div>
            </div>
            {showReason && (
              <div className="flex flex-col flex-1">
                <div className="text-xs text-muted-foreground mb-1">
                  Gamintojo kodas
                </div>
                <div className="text-sm">
                  {(item as any).manufacturerCode ||
                    (item as any).partCode ||
                    "-"}
                </div>
              </div>
            )}
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
                  <div>-</div>
                )}
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                Kėbulo tipas
              </div>
              <div className="text-sm">
                {showReason
                  ? (item as any).carBodyType || "-"
                  : item.bodyType || "-"}
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                Kuro tipas
              </div>
              <div className="text-sm">
                {showReason
                  ? (item as any).carFuelType || "-"
                  : item.fuelType || "-"}
              </div>
            </div>
            <div className="flex flex-col flex-1">
              <div className="text-xs text-muted-foreground mb-1">
                Variklio tūris
              </div>
              <div className="text-sm">
                {showReason
                  ? (item as any).carEngineCapacity
                    ? `${(item as any).carEngineCapacity}cc`
                    : "-"
                  : item.engineCapacity
                  ? `${item.engineCapacity}cc`
                  : "-"}
              </div>
            </div>
            {!showReason && (
              <div className="flex flex-col flex-1">
                <div className="text-xs text-muted-foreground mb-1">
                  Gamintojo kodas
                </div>
                <div className="text-sm">{item.manufacturerCode || "-"}</div>
              </div>
            )}
            {showReason && (
              <div className="flex flex-col flex-1">
                <div className="text-xs text-muted-foreground mb-1">
                  Priežastis
                </div>
                <div className="text-sm">{(item as any).reason || "-"}</div>
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
