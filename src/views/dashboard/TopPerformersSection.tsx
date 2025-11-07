import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { useAppSelector } from "@/store/hooks";
import { selectFilters, makeSelectTopPerformers } from "@/store/selectors";
import { useState, useMemo } from "react";
import { TrendingUp, Package, DollarSign, Clock } from "lucide-react";

export function TopPerformersSection() {
  const filters = useAppSelector(selectFilters);
  const [limit, setLimit] = useState(10);
  const [view, setView] = useState<"card" | "table">("card");

  const additionalFilters = filters.topPerformers
    ? {
        ...(filters.topPerformers.brand && {
          carBrand: [filters.topPerformers.brand],
        }),
        ...(filters.topPerformers.model && {
          carModel: [filters.topPerformers.model],
        }),
        ...(filters.topPerformers.category && {
          partCategory: [filters.topPerformers.category],
        }),
      }
    : undefined;

  const topPerformersSelector = useMemo(
    () => makeSelectTopPerformers(limit, additionalFilters),
    [limit, additionalFilters]
  );
  const topPerformers = useAppSelector(topPerformersSelector);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performers
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={String(limit)}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-32"
            >
              <option value="10">Top 10</option>
              <option value="50">Top 50</option>
              <option value="100">Top 100</option>
            </Select>
            <Select
              value={view}
              onChange={(e) => setView(e.target.value as "card" | "table")}
              className="w-32"
            >
              <option value="card">Card View</option>
              <option value="table">Table View</option>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === "card" ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {topPerformers.map((part, index) => (
              <Card key={part.id} className="relative">
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                  #{index + 1}
                </div>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <img
                      src={part.photos[0]}
                      alt={part.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm line-clamp-2">
                        {part.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {part.carBrand} {part.carModel} ({part.carYear})
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      Status: {part.status}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />€{part.priceEUR}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {part.daysInInventory} days in inventory
                  </div>
                  <div className="text-xs">
                    <span className="font-medium">Category:</span>{" "}
                    {part.category}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Rank</th>
                  <th className="text-left p-2">Part</th>
                  <th className="text-left p-2">Car</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-left p-2">Price</th>
                  <th className="text-left p-2">Days</th>
                </tr>
              </thead>
              <tbody>
                {topPerformers.map((part, index) => (
                  <tr key={part.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-bold">#{index + 1}</td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={part.photos[0]}
                          alt={part.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <span className="text-sm">{part.name}</span>
                      </div>
                    </td>
                    <td className="p-2 text-sm">
                      {part.carBrand} {part.carModel} ({part.carYear})
                    </td>
                    <td className="p-2 text-sm">{part.status}</td>
                    <td className="p-2 text-sm">€{part.priceEUR}</td>
                    <td className="p-2 text-sm">{part.daysInInventory}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
