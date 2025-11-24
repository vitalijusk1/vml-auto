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

// Filter option type for storing filter selections with both name and ID
export const TopDetailsFilter = {
  TOP_SELLING: "top-detales",
  LEAST_SELLING: "reciausiai-parduodamos",
  NONE: "be-filtro",
} as const;

export type TopDetailsFilter =
  (typeof TopDetailsFilter)[keyof typeof TopDetailsFilter];

export interface FilterOption {
  name: string;
  id: number;
}

// Range filter field names in FilterState
export type RangeFilterField =
  | "yearRange"
  | "priceRange"
  | "engineCapacityRange";

export interface Car {
  id: number;
  photo: string | null;
  photo_gallery: string[];
  brand: {
    id: number;
    name: string;
  };
  model: {
    id: number;
    name: string;
  };
  year: number;
  model_year: number | null;
  engine: {
    code: string | null;
    capacity: number;
    power: number | null;
  };
  fuel: {
    id: number;
    name: string;
  } | null;
  body_type: {
    id: number;
    name: string;
  } | null;
  wheel_drive: {
    id: number;
    name: string;
  } | null;
  wheel_type: {
    id: number;
    name: string;
  } | null;
  gearbox_type: {
    id: number;
    name: string;
  } | null;
  color: {
    id: number;
    name: string;
  } | null;
  color_code: string | null;
  interior: string;
  category: {
    id: number;
    name: string;
  } | null;
  mileage: number | null;
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
  fuelType?: string;
  engineVolume?: string;
  quality?: string;
  qualityId?: number;
  // Expandable parts functionality
  part_ids?: number[];
  items_count?: number;
  qualities?: Record<string, number>;
  statuses?: Record<string, number>;
  price_min?: number;
  price_max?: number;
  price_avg?: number;
  total_sold?: number;
  time_in_warehouse_days?: number;
  // Child parts for expanded state
  childParts?: Part[];
  isExpanded?: boolean;
  isChildPart?: boolean;
  parentPartId?: string;
  // Wheel-specific fields (optional)
  wheelDrive?: "AWD" | "RWD" | "FWD";
  wheelSide?: "Left" | "Right";
  wheelCentralDiameter?: number;
  wheelFixingPoints?: number;
  wheelHeight?: number;
  wheelSpacing?: number;
  wheelTreadDepth?: number;
  wheelWidth?: number;
  analysisStatusCounts?: {
    available: number;
    reserved: number;
    sold: number;
  };
}

export interface OrderItem {
  partId: string;
  partName: string;
  quantity: number;
  priceEUR: number;
  pricePLN: number;
  photo?: string;
  photoGallery?: string[];
  carId?: string | number;
  carBrand?: string;
  carModel?: string;
  carYear?: number;
  bodyType?: string;
  engineCapacity?: number;
  fuelType?: string;
  manufacturerCode?: string;
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
  itemOrderId?: string; // order_id from items
  itemId?: string; // id from items
  dateCreated: Date;
  customerId: string;
  customer: Customer;
  items: Array<{
    partId: string;
    partName: string;
    quantity: number;
    reason: string;
    price: number;
    priceEUR: number;
    pricePLN: number;
    // Part details from API
    partCode?: string;
    partCategory?: string;
    partStatus?: string;
    partWarehouse?: string;
    partPriceEUR?: number;
    photo?: string;
    photoGallery?: string[];
    manufacturerCode?: string;
    carBrand?: string;
    carModel?: string;
    carYear?: number;
    carBodyType?: string;
    carFuelType?: string;
    carEngineCapacity?: number;
  }>;
  refundableAmountEUR: number;
  refundableAmountPLN: number;
  returnAmount: number;
  status: ReturnStatus;
  returnStatus: string;
  refundStatus?: string;
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
  status: FilterOption[] | "All";
  dateRange: {
    from?: Date;
    to?: Date;
  };
  carBrand: FilterOption[];
  carModel: FilterOption[];
  carYear: number[];
  yearRange: {
    min?: number;
    max?: number;
  };
  fuelType: FilterOption[];
  engineCapacityRange?: {
    min?: number;
    max?: number;
  };
  gearbox?: FilterOption[];
  bodyType: FilterOption[];
  partCategory: FilterOption[];
  partType: FilterOption[];
  quality: FilterOption[];
  position: FilterOption[];
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
  wheelDrive?: FilterOption[];
  wheelSide?: FilterOption[];
  wheelCentralDiameter?: FilterOption[];
  wheelFixingPoints?: FilterOption[];
  wheelHeight?: FilterOption[];
  wheelSpacing?: FilterOption[];
  wheelTreadDepth?: FilterOption[];
  wheelWidth?: FilterOption[];
  // Warehouse filter
  warehouse?: FilterOption[];
}
