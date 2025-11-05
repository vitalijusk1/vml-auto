import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectParts } from "@/store/selectors";
import { setFilters } from "@/store/slices/filtersSlice";
import { AlertTriangle, Download, Tag } from "lucide-react";
import { useMemo } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function StaleInventoryAlert() {
  const dispatch = useAppDispatch();
  const parts = useAppSelector(selectParts);

  const staleInventory = useMemo(() => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const staleParts = parts
      .filter((p) => p.status === "In Stock")
      .filter((p) => p.dateAdded <= sixMonthsAgo)
      .sort((a, b) => a.dateAdded.getTime() - b.dateAdded.getTime());

    return {
      all: staleParts,
      sixMonths: staleParts.filter(
        (p) => p.dateAdded <= sixMonthsAgo && p.dateAdded > twelveMonthsAgo
      ),
      twelveMonths: staleParts.filter((p) => p.dateAdded <= twelveMonthsAgo),
      threeMonths: staleParts.filter(
        (p) => p.dateAdded <= threeMonthsAgo && p.dateAdded > sixMonthsAgo
      ),
    };
  }, [parts]);

  const handleShowStale = () => {
    dispatch(setFilters({ inventoryAge: { quickFilter: "stale" } }));
  };

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <CardTitle className="text-red-900">
              Stale Inventory Alert
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShowStale}>
              View All Stale
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-muted-foreground">3-6 Months</div>
            <div className="text-2xl font-bold text-orange-600">
              {staleInventory.threeMonths.length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-muted-foreground">6-12 Months</div>
            <div className="text-2xl font-bold text-red-600">
              {staleInventory.sixMonths.length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-muted-foreground">12+ Months</div>
            <div className="text-2xl font-bold text-red-800">
              {staleInventory.twelveMonths.length}
            </div>
          </div>
        </div>

        {staleInventory.all.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Oldest Unsold Parts</h3>
            <div className="border rounded-lg overflow-hidden bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Part Name</TableHead>
                    <TableHead>Car</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Days in Inventory</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staleInventory.all.slice(0, 10).map((part) => (
                    <TableRow key={part.id}>
                      <TableCell className="font-medium">{part.name}</TableCell>
                      <TableCell>
                        {part.carBrand} {part.carModel} ({part.carYear})
                      </TableCell>
                      <TableCell>€{part.priceEUR}</TableCell>
                      <TableCell className="text-red-600 font-semibold">
                        {part.daysInInventory}
                      </TableCell>
                      <TableCell>
                        {format(part.dateAdded, "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Tag className="h-4 w-4 mr-1" />
                            Mark for Sale
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {staleInventory.all.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <p>No stale inventory found. Great job!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
