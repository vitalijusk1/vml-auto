import { ColumnDef } from "@tanstack/react-table";
import { Car } from "@/types";
import { format } from "date-fns";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CarTableColumns(
  onItemClick: (car: Car) => void
): ColumnDef<Car>[] {
  return [
    {
      accessorKey: "photo",
      header: "Photo",
      cell: ({ row }) => (
        <button
          onClick={() => onItemClick(row.original)}
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <img
            src={row.original.photo}
            alt={`${row.original.brand} ${row.original.model.name}`}
            className="w-16 h-16 object-cover rounded"
          />
        </button>
      ),
    },
    {
      accessorKey: "id",
      header: "Car ID",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.id}</span>
      ),
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
      cell: ({ row }) => row.original.fuel.name,
    },
    {
      accessorKey: "body_type",
      header: "Body Type",
      cell: ({ row }) => row.original.body_type.name,
    },
    {
      accessorKey: "gearbox_type",
      header: "Gearbox",
      cell: ({ row }) => row.original.gearbox_type.name,
    },
    {
      accessorKey: "engine",
      header: "Engine",
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.engine.code}</div>
          <div className="text-xs text-muted-foreground">
            {row.original.engine.capacity}cc / {row.original.engine.power}hp
          </div>
        </div>
      ),
    },
    {
      accessorKey: "mileage",
      header: "Mileage",
      cell: ({ row }) => `${row.original.mileage.toLocaleString()} km`,
    },
    {
      accessorKey: "color",
      header: "Color",
      cell: ({ row }) => (
        <div className="text-sm">
          <div>{row.original.color.name}</div>
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
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onItemClick(row.original)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
}

