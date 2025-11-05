import { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { selectOrders } from "@/store/selectors";
import { OrderStatus } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Eye, Printer } from "lucide-react";

import { getStatusBadgeClass } from "@/theme/utils";

const getOrderStatusClass = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, string> = {
    Pending: getStatusBadgeClass("order", "Pending"),
    Processing: getStatusBadgeClass("order", "Processing"),
    Shipped: getStatusBadgeClass("order", "Shipped"),
    Delivered: getStatusBadgeClass("order", "Delivered"),
    Cancelled: getStatusBadgeClass("order", "Cancelled"),
  };
  return statusMap[status] || getStatusBadgeClass("order", "Pending");
};

export function OrdersView() {
  const orders = useAppSelector(selectOrders);
  const [activeTab, setActiveTab] = useState<
    "active" | "completed" | "returns"
  >("active");

  const activeOrders = orders.filter(
    (o) => o.status !== "Delivered" && o.status !== "Cancelled"
  );
  const completedOrders = orders.filter((o) => o.status === "Delivered");
  const cancelledOrders = orders.filter((o) => o.status === "Cancelled");

  const displayOrders =
    activeTab === "active"
      ? activeOrders
      : activeTab === "completed"
      ? completedOrders
      : cancelledOrders;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Orders Management</h1>
        <p className="text-muted-foreground">
          Manage customer orders and shipments
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Button
              variant={activeTab === "active" ? "default" : "outline"}
              onClick={() => setActiveTab("active")}
            >
              Active Orders ({activeOrders.length})
            </Button>
            <Button
              variant={activeTab === "completed" ? "default" : "outline"}
              onClick={() => setActiveTab("completed")}
            >
              Completed ({completedOrders.length})
            </Button>
            <Button
              variant={activeTab === "returns" ? "default" : "outline"}
              onClick={() => setActiveTab("returns")}
            >
              Cancelled ({cancelledOrders.length})
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Shipping Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{format(order.date, "MMM dd, yyyy")}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer.name}</div>
                      {order.customer.isCompany && (
                        <div className="text-xs text-muted-foreground">
                          {order.customer.companyName}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{order.customer.country}</TableCell>
                  <TableCell>{order.items.length} items</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        €{order.totalAmountEUR.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        PLN {order.totalAmountPLN.toLocaleString()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getOrderStatusClass(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell>{order.paymentMethod}</TableCell>
                  <TableCell>{order.shippingStatus}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Printer className="h-4 w-4" />
                      </Button>
                    </div>
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
