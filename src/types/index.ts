export type PartStatus = "In Stock" | "Reserved" | "Sold" | "Returned";
export type CarStatus = "Purchased" | "For Dismantling" | "Dismantled" | "Sold";
export type OrderStatus =
  | "Pending"
  | "Processing"
  | "Shipped"
  | "Delivered"
  | "Cancelled";
export type ReturnStatus = "Requested" | "Approved" | "Refunded" | "Rejected";
export type PartQuality = "New" | "Used" | "With Defects" | "Restored";
export type PartPosition = "Left" | "Right" | "Front" | "Rear" | "Set";
export type FuelType = "Petrol" | "Diesel" | "Electric" | "Hybrid";
export type BodyType =
  | "Sedan"
  | "Hatchback"
  | "SUV"
  | "Coupe"
  | "Estate"
  | "Van";

export interface Car {
  id: number;
  photo: string;
  photo_gallery: string[];
  brand: string;
  model: {
    id: number;
    name: string;
  };
  year: number;
  model_year: number;
  engine: {
    code: string;
    capacity: number;
    power: number;
  };
  fuel: {
    id: number;
    name: string;
  };
  body_type: {
    id: number;
    name: string;
  };
  wheel_drive: {
    id: number;
    name: string;
  };
  wheel_type: {
    id: number;
    name: string;
  };
  gearbox_type: {
    id: number;
    name: string;
  };
  color: {
    id: number;
    name: string;
  };
  color_code: string;
  interior: string;
  category: {
    id: number;
    name: string;
  };
  mileage: number;
  defectation_notes: string;
  last_synced_at: string;
}

export interface Part {
  id: string;
  code: string;
  name: string;
  category: string;
  partType: string;
  carId: string;
  carBrand: string;
  carModel: string;
  carYear: number;
  manufacturerCode?: string;
  status: PartStatus;
  priceEUR: number;
  pricePLN: number;
  position?: PartPosition;
  daysInInventory: number;
  dateAdded: Date;
  dateSold?: Date;
  photos: string[];
  warehouse?: string;
  // Wheel-specific fields (optional)
  wheelDrive?: "AWD" | "RWD" | "FWD";
  wheelSide?: "Left" | "Right";
  wheelCentralDiameter?: number;
  wheelFixingPoints?: number;
  wheelHeight?: number;
  wheelSpacing?: number;
  wheelTreadDepth?: number;
  wheelWidth?: number;
}

export interface OrderItem {
  partId: string;
  partName: string;
  quantity: number;
  priceEUR: number;
  pricePLN: number;
  photo?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  country: string;
  city?: string;
  address?: string;
  isCompany: boolean;
  companyName?: string;
  vatNumber?: string;
  viesValidated?: boolean;
}

export interface Order {
  id: string;
  date: Date;
  customerId: string;
  customer: Customer;
  items: OrderItem[];
  totalAmountEUR: number;
  totalAmountPLN: number;
  shippingCostEUR: number;
  shippingCostPLN: number;
  status: OrderStatus;
  paymentMethod: string;
  shippingStatus: string;
  invoiceUrl?: string;
  shippingLabelUrl?: string;
}

export interface Return {
  id: string;
  orderId: string;
  dateCreated: Date;
  customerId: string;
  customer: Customer;
  items: Array<{
    partId: string;
    partName: string;
    quantity: number;
    reason: string;
    priceEUR: number;
    pricePLN: number;
  }>;
  refundableAmountEUR: number;
  refundableAmountPLN: number;
  status: ReturnStatus;
  creditNoteUrl?: string;
}

export interface DashboardMetrics {
  totalPartsInStock: number;
  totalPartsSold: number;
  totalPartsAllTime: number;
  revenueCurrentMonth: number;
  topSellingCategory: string;
  partsOlderThan6Months: number;
}

export interface FilterState {
  search: string;
  status: PartStatus | "All";
  dateRange: {
    from?: Date;
    to?: Date;
  };
  carBrand: string[];
  carModel: string[];
  carYear: number[];
  yearRange: {
    min?: number;
    max?: number;
  };
  fuelType: FuelType[];
  bodyType: BodyType[];
  partCategory: string[];
  partType: string[];
  quality: PartQuality[];
  position: PartPosition[];
  priceRange: {
    min?: number;
    max?: number;
  };
  inventoryAge: {
    notSoldMonths?: number;
    quickFilter?: "stale" | "new";
  };
  staleMonths?: number;
  topPerformers?: {
    limit: number;
    brand?: string;
    model?: string;
    category?: string;
  };
  // Wheel-specific filters
  wheelDrive?: ("AWD" | "RWD" | "FWD")[];
  wheelSide?: ("Left" | "Right")[];
  wheelCentralDiameter?: number[];
  wheelFixingPoints?: number[];
  wheelHeight?: number[];
  wheelSpacing?: number[];
  wheelTreadDepth?: number[];
  wheelWidth?: number[];
  // Warehouse filter
  warehouse?: string[];
}
