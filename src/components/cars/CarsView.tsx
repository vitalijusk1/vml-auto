import { useAppSelector } from "@/store/hooks";
import { selectCars } from "@/store/selectors";
import { CarStatus } from "@/types";
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

import { getStatusBadgeClass } from "@/theme/utils";

const getCarStatusClass = (status: CarStatus) => {
  const statusMap: Record<CarStatus, string> = {
    Purchased: getStatusBadgeClass("car", "Purchased"),
    "For Dismantling": getStatusBadgeClass("car", "For Dismantling"),
    Dismantled: getStatusBadgeClass("car", "Dismantled"),
    Sold: getStatusBadgeClass("car", "Sold"),
  };
  return statusMap[status] || getStatusBadgeClass("car", "Sold");
};

export function CarsView() {
  const cars = useAppSelector(selectCars);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Car Inventory</h1>
        <p className="text-muted-foreground">
          Manage your car inventory and parts availability
        </p>
      </div>

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
                <TableHead>Status</TableHead>
                <TableHead>Parts Available</TableHead>
                <TableHead>Parts Sold</TableHead>
                <TableHead>Value Remaining</TableHead>
                <TableHead>Date Purchased</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cars.map((car) => (
                <TableRow key={car.id}>
                  <TableCell>
                    <img
                      src={car.photo}
                      alt={`${car.brand} ${car.model}`}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{car.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {car.brand} {car.model}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        VIN: {car.vin}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{car.year}</TableCell>
                  <TableCell>{car.fuelType}</TableCell>
                  <TableCell>{car.bodyType}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getCarStatusClass(car.status)}`}
                    >
                      {car.status}
                    </span>
                  </TableCell>
                  <TableCell>{car.totalPartsAvailable}</TableCell>
                  <TableCell>{car.totalPartsSold}</TableCell>
                  <TableCell>€{car.valueRemaining.toLocaleString()}</TableCell>
                  <TableCell>
                    {format(car.datePurchased, "MMM dd, yyyy")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
