import { useState, useEffect, Fragment } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectOrders } from "@/store/selectors";
import { OrderStatus, Order, OrderItem, Customer } from "@/types";
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
import { Eye, Printer, ChevronDown, ChevronUp } from "lucide-react";
import { setOrders } from "@/store/slices/dataSlice";

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

// Generate fake orders data
const generateFakeOrders = (): Order[] => {
  const customers: Customer[] = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "+1234567890",
      country: "USA",
      city: "New York",
      address: "123 Main St",
      isCompany: false,
    },
    {
      id: "2",
      name: "Auto Parts Ltd",
      email: "contact@autoparts.com",
      phone: "+9876543210",
      country: "Germany",
      city: "Berlin",
      address: "456 Business Ave",
      isCompany: true,
      companyName: "Auto Parts Ltd",
      vatNumber: "DE123456789",
    },
    {
      id: "3",
      name: "Maria Garcia",
      email: "maria.garcia@example.com",
      phone: "+1122334455",
      country: "Spain",
      city: "Madrid",
      address: "789 Calle Principal",
      isCompany: false,
    },
    {
      id: "4",
      name: "Mechanical Solutions Inc",
      email: "info@mechsolutions.com",
      phone: "+9988776655",
      country: "Poland",
      city: "Warsaw",
      address: "321 Industrial Blvd",
      isCompany: true,
      companyName: "Mechanical Solutions Inc",
      vatNumber: "PL987654321",
    },
    {
      id: "5",
      name: "Robert Johnson",
      email: "robert.j@example.com",
      phone: "+5544332211",
      country: "UK",
      city: "London",
      address: "555 High Street",
      isCompany: false,
    },
  ];

  const partNames = [
    "Brake Pad Set",
    "Front Bumper",
    "Headlight Assembly",
    "Radiator",
    "Alternator",
    "Starter Motor",
    "Fuel Pump",
    "Timing Belt",
    "Water Pump",
    "Shock Absorber",
    "Wheel Bearing",
    "Catalytic Converter",
    "Oxygen Sensor",
    "Spark Plug Set",
    "Air Filter",
  ];

  const statuses: OrderStatus[] = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ];

  const paymentMethods = ["Credit Card", "PayPal", "Bank Transfer", "Invoice"];
  const shippingStatuses = [
    "Not Shipped",
    "Preparing",
    "In Transit",
    "Out for Delivery",
    "Delivered",
  ];

  const orders: Order[] = [];
  const now = new Date();

  for (let i = 1; i <= 20; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const items: OrderItem[] = [];

    for (let j = 0; j < itemCount; j++) {
      const partName = partNames[Math.floor(Math.random() * partNames.length)];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const priceEUR = Math.floor(Math.random() * 500) + 50;
      const pricePLN = priceEUR * 4.5;

      items.push({
        partId: `PART-${i}-${j}`,
        partName,
        quantity,
        priceEUR,
        pricePLN,
        photo: `https://via.placeholder.com/100?text=${encodeURIComponent(partName)}`,
      });
    }

    const totalAmountEUR = items.reduce(
      (sum, item) => sum + item.priceEUR * item.quantity,
      0
    );
    const totalAmountPLN = items.reduce(
      (sum, item) => sum + item.pricePLN * item.quantity,
      0
    );
    const shippingCostEUR = Math.floor(Math.random() * 50) + 10;
    const shippingCostPLN = shippingCostEUR * 4.5;

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const daysAgo = Math.floor(Math.random() * 60);
    const orderDate = new Date(now);
    orderDate.setDate(orderDate.getDate() - daysAgo);

    orders.push({
      id: `ORD-${String(i).padStart(4, "0")}`,
      date: orderDate,
      customerId: customer.id,
      customer,
      items,
      totalAmountEUR: totalAmountEUR + shippingCostEUR,
      totalAmountPLN: totalAmountPLN + shippingCostPLN,
      shippingCostEUR,
      shippingCostPLN,
      status,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      shippingStatus: shippingStatuses[Math.floor(Math.random() * shippingStatuses.length)],
    });
  }

  return orders;
};

export function OrdersView() {
  const dispatch = useAppDispatch();
  const orders = useAppSelector(selectOrders);
  const [activeTab, setActiveTab] = useState<
    "active" | "completed" | "returns"
  >("active");
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Initialize fake orders if empty
  useEffect(() => {
    if (orders.length === 0) {
      const fakeOrders = generateFakeOrders();
      dispatch(setOrders(fakeOrders));
    }
  }, [orders.length, dispatch]);

  // Expand all orders by default when orders are loaded
  useEffect(() => {
    if (orders.length > 0 && expandedOrders.size === 0) {
      setExpandedOrders(new Set(orders.map((o) => o.id)));
    }
  }, [orders.length]);

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

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
              {displayOrders.map((order) => {
                const isExpanded = expandedOrders.has(order.id);
                return (
                  <Fragment key={order.id}>
                    <TableRow>
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
                      <TableCell>
                        <button
                          onClick={() => toggleOrderExpansion(order.id)}
                          className="flex items-center gap-2 hover:text-primary transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span>{order.items.length} items</span>
                        </button>
                      </TableCell>
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
                    {isExpanded && (
                      <TableRow key={`${order.id}-expanded`}>
                        <TableCell colSpan={10} className="bg-muted/30 p-2">
                          <div className="space-y-1.5">
                            <h4 className="font-semibold text-xs mb-1.5">
                              Order Items ({order.items.length})
                            </h4>
                            <div className="grid gap-1.5">
                              {order.items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 p-1.5 bg-background rounded border text-sm"
                                >
                                  {item.photo && (
                                    <img
                                      src={item.photo}
                                      alt={item.partName}
                                      className="w-10 h-10 object-cover rounded flex-shrink-0"
                                    />
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <div className="font-medium text-sm truncate">{item.partName}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {item.partId}
                                    </div>
                                  </div>
                                  <div className="text-right text-xs">
                                    <div className="font-medium">
                                      Qty: {item.quantity}
                                    </div>
                                    <div className="text-muted-foreground">
                                      €{item.priceEUR.toLocaleString()}/ea
                                    </div>
                                  </div>
                                  <div className="text-right min-w-[80px] text-xs">
                                    <div className="font-semibold">
                                      €
                                      {(item.priceEUR * item.quantity).toLocaleString()}
                                    </div>
                                    <div className="text-muted-foreground">
                                      PLN{" "}
                                      {(item.pricePLN * item.quantity).toLocaleString()}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="flex justify-between items-center pt-1.5 border-t text-xs">
                              <div className="text-muted-foreground">
                                Shipping: €{order.shippingCostEUR.toLocaleString()} (PLN{" "}
                                {order.shippingCostPLN.toLocaleString()})
                              </div>
                              <div className="text-right">
                                <div className="text-muted-foreground">Total</div>
                                <div className="font-bold text-sm">
                                  €{order.totalAmountEUR.toLocaleString()}
                                </div>
                                <div className="text-muted-foreground text-xs">
                                  PLN {order.totalAmountPLN.toLocaleString()}
                                </div>
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
