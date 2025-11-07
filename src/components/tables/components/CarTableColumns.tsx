import { ColumnDef } from "@tanstack/react-table";
import { Car } from "@/types";
import { format } from "date-fns";
import { PhotoTableCell } from "@/components/ui/PhotoTableCell";

export function CarTableColumns(
  onItemClick: (car: Car) => void
): ColumnDef<Car>[] {
  return [
    {
      accessorKey: "photo",
      header: "Photo",
      cell: ({ row }) => (
        <PhotoTableCell
          src={row.original.photo || ""}
          alt={`${row.original.brand} ${row.original.model.name}`}
          onClick={() => onItemClick(row.original)}
          size="md"
        />
      ),
    },
    {
      accessorKey: "id",
      header: "Car ID",
      cell: ({ row }) => <span className="font-medium">{row.original.id}</span>,
    },
    {
      accessorKey: "brand",
      header: "Brand & Model",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.brand} {row.original.model.name}
        </div>
      ),
    },
    {
      accessorKey: "year",
      header: "Year",
    },
    {
      accessorKey: "fuel",
      header: "Fuel Type",
      cell: ({ row }) => row.original.fuel?.name || "-",
    },
    {
      accessorKey: "body_type",
      header: "Body Type",
      cell: ({ row }) => row.original.body_type?.name || "-",
    },
    {
      accessorKey: "gearbox_type",
      header: "Gearbox",
      cell: ({ row }) => row.original.gearbox_type?.name || "-",
    },
    {
      accessorKey: "engine",
      header: "Engine",
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.engine.code || "-"}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.engine.capacity}cc{" "}
            {row.original.engine.power
              ? `/ ${row.original.engine.power}hp`
              : ""}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "mileage",
      header: "Mileage",
      cell: ({ row }) =>
        row.original.mileage
          ? `${row.original.mileage.toLocaleString()} km`
          : "-",
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.color?.name || "-"}</div>
          {row.original.color_code && (
            <div className="text-xs text-muted-foreground">
              {row.original.color_code}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "last_synced_at",
      header: "Last Synced",
      cell: ({ row }) =>
        format(new Date(row.original.last_synced_at), "MMM dd, yyyy"),
    },
  ];
}
