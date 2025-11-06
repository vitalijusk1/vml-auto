import { useState, useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectCars } from "@/store/selectors";
import { Car } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { UnifiedFilterPanel } from "../filters/UnifiedFilterPanel";
import {
  filterCars,
  defaultCarFilters,
  CarFilterState,
} from "@/utils/filterCars";
import { CarDetailModal } from "./CarDetailModal";

export function CarsView() {
  const cars = useAppSelector(selectCars);
  const [filters, setFilters] = useState<CarFilterState>(defaultCarFilters);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredCars = useMemo(
    () => filterCars(cars, filters),
    [cars, filters]
  );

  const handlePhotoClick = (car: Car) => {
    setSelectedCar(car);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCar(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Car Inventory</h1>
        <p className="text-muted-foreground">
          Manage your car inventory and parts availability
        </p>
      </div>

      <UnifiedFilterPanel
        type="car"
        filters={filters}
        onFiltersChange={setFilters}
      />

      <Card>
        <CardHeader>
          <CardTitle>Cars</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Photo</TableHead>
                <TableHead>Car ID</TableHead>
                <TableHead>Brand & Model</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Fuel Type</TableHead>
                <TableHead>Body Type</TableHead>
                <TableHead>Gearbox</TableHead>
                <TableHead>Engine</TableHead>
                <TableHead>Mileage</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Last Synced</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCars.map((car) => {
                return (
                  <TableRow key={car.id}>
                    <TableCell>
                      <button
                        onClick={() => handlePhotoClick(car)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <img
                          src={car.photo}
                          alt={`${car.brand} ${car.model.name}`}
                          className="w-16 h-16 object-cover rounded"
                        />
                      </button>
                    </TableCell>
                    <TableCell className="font-medium">{car.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {car.brand} {car.model.name}
                      </div>
                    </TableCell>
                    <TableCell>{car.year}</TableCell>
                    <TableCell>{car.fuel.name}</TableCell>
                    <TableCell>{car.body_type.name}</TableCell>
                    <TableCell>{car.gearbox_type.name}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{car.engine.code}</div>
                        <div className="text-xs text-muted-foreground">
                          {car.engine.capacity}cc / {car.engine.power}hp
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{car.mileage.toLocaleString()} km</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{car.color.name}</div>
                        {car.color_code && (
                          <div className="text-xs text-muted-foreground">
                            {car.color_code}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(car.last_synced_at), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CarDetailModal
        car={selectedCar}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
