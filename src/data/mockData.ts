import { Car, Part, Order, Return, Customer, PartStatus, OrderStatus, ReturnStatus, PartQuality, PartPosition, FuelType, BodyType } from '../types';

const brands = ['BMW', 'Mercedes-Benz', 'Audi', 'Volkswagen', 'Toyota', 'Ford', 'Opel', 'Peugeot', 'Renault', 'Volvo'];
const models: Record<string, string[]> = {
  'BMW': ['3 Series', '5 Series', 'X3', 'X5', '1 Series'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLC', 'A-Class'],
  'Audi': ['A3', 'A4', 'A6', 'Q5', 'Q7'],
  'Volkswagen': ['Golf', 'Passat', 'Tiguan', 'Polo', 'Jetta'],
  'Toyota': ['Corolla', 'Camry', 'RAV4', 'Prius', 'Yaris'],
  'Ford': ['Focus', 'Mondeo', 'Kuga', 'Fiesta', 'Mustang'],
  'Opel': ['Astra', 'Insignia', 'Corsa', 'Mokka', 'Vectra'],
  'Peugeot': ['308', '508', '3008', '208', '2008'],
  'Renault': ['Clio', 'Megane', 'Kadjar', 'Captur', 'Scenic'],
  'Volvo': ['XC60', 'XC90', 'S60', 'V60', 'V40'],
};

const partCategories = ['Engine', 'Transmission', 'Body Parts', 'Electrical', 'Suspension', 'Brakes', 'Interior', 'Exterior', 'Lighting', 'Wheels & Tires'];
const partTypes = ['Engine Block', 'Gearbox', 'Door Panel', 'Headlight', 'Bumper', 'Seat', 'Dashboard', 'ECU', 'Shock Absorber', 'Brake Disc', 'Window', 'Mirror'];
const warehouses = ['Warehouse A', 'Warehouse B', 'Warehouse C', 'Main Warehouse', 'Secondary Warehouse'];

const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Lisa', 'James', 'Maria'];
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore'];
const countries = ['Lithuania', 'Poland', 'Germany', 'Latvia', 'Estonia', 'UK', 'France', 'Netherlands'];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const fuelTypes = ['Petrol', 'Diesel', 'Electric', 'Hybrid'];
const bodyTypes = ['Sedan', 'Hatchback', 'SUV', 'Coupe', 'Estate', 'Van'];
const wheelDrives = ['FWD', 'RWD', 'AWD', '4WD'];
const wheelTypes = ['Alloy', 'Steel', 'Forged'];
const gearboxTypes = ['Manual', 'Automatic', 'CVT', 'DCT', 'AMT'];
const colors = ['Black', 'White', 'Silver', 'Gray', 'Blue', 'Red', 'Green', 'Brown'];
const categories = ['Compact', 'Mid-size', 'Full-size', 'Luxury', 'Sports', 'SUV', 'Van'];

export function generateMockCars(count: number = 50): Car[] {
  const cars: Car[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const brand = randomElement(brands);
    const modelName = randomElement(models[brand] || ['Unknown']);
    const year = randomInt(2000, 2023);
    const modelYear = randomInt(year - 2, year);
    const fuelType = randomElement(fuelTypes);
    const bodyType = randomElement(bodyTypes);
    
    cars.push({
      id: i + 1,
      photo: `https://picsum.photos/seed/car-${i}-main/400/300`,
      photo_gallery: [
        `https://picsum.photos/seed/car-${i}-1/400/300`,
        `https://picsum.photos/seed/car-${i}-2/400/300`,
        `https://picsum.photos/seed/car-${i}-3/400/300`,
      ],
      brand,
      model: {
        id: randomInt(100, 999),
        name: modelName,
      },
      year,
      model_year: modelYear,
      engine: {
        code: `ENG${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        capacity: randomElement([1000, 1200, 1400, 1600, 1800, 2000, 2200, 2500, 3000, 3500, 4000]),
        power: randomInt(75, 350),
      },
      fuel: {
        id: fuelTypes.indexOf(fuelType) + 1,
        name: fuelType,
      },
      body_type: {
        id: bodyTypes.indexOf(bodyType) + 1,
        name: bodyType,
      },
      wheel_drive: {
        id: randomInt(1, 4),
        name: randomElement(wheelDrives),
      },
      wheel_type: {
        id: randomInt(1, 3),
        name: randomElement(wheelTypes),
      },
      gearbox_type: {
        id: randomInt(1, 5),
        name: randomElement(gearboxTypes),
      },
      color: {
        id: randomInt(1, 10),
        name: randomElement(colors),
      },
      color_code: `${randomInt(100, 999)}`,
      interior: randomElement(['Black leather', 'Beige fabric', 'Gray fabric', 'Brown leather', 'Black fabric']),
      category: {
        id: randomInt(900, 1000),
        name: randomElement(categories),
      },
      mileage: randomInt(50000, 250000),
      defectation_notes: randomElement([
        'Minor front-end damage',
        'No defects',
        'Scratches on rear bumper',
        'Dent on driver side door',
        'Windshield crack',
        'Minor rust spots',
      ]),
      last_synced_at: randomDate(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now).toISOString(),
    });
  }
  
  return cars;
}

export function generateMockParts(count: number = 500, cars: Car[]): Part[] {
  const parts: Part[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const car = randomElement(cars);
    const status = randomElement<PartStatus>(['In Stock', 'Reserved', 'Sold', 'Returned']);
    const dateAdded = randomDate(new Date(now.getTime() - 730 * 24 * 60 * 60 * 1000), now);
    const daysInInventory = Math.floor((now.getTime() - dateAdded.getTime()) / (1000 * 60 * 60 * 24));
    const dateSold = status === 'Sold' || status === 'Returned'
      ? randomDate(dateAdded, now)
      : undefined;
    
    parts.push({
      id: `PART-${String(i + 1).padStart(6, '0')}`,
      code: `CODE-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      name: `${randomElement(partTypes)} - ${randomElement(partCategories)}`,
      category: randomElement(partCategories),
      partType: randomElement(partTypes),
      carId: car.id.toString(),
      carBrand: car.brand,
      carModel: car.model.name,
      carYear: car.year,
      manufacturerCode: `MFR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      status,
      priceEUR: randomInt(10, 500),
      pricePLN: randomInt(50, 2500),
      position: randomElement<PartPosition>(['Left', 'Right', 'Front', 'Rear', 'Set']),
      daysInInventory,
      dateAdded,
      dateSold,
      photos: [
        `https://picsum.photos/seed/part-${i}-1/300/200`,
        `https://picsum.photos/seed/part-${i}-2/300/200`,
      ],
      warehouse: randomElement(warehouses),
    });
  }
  
  return parts;
}

export function generateMockCustomers(count: number = 100): Customer[] {
  const customers: Customer[] = [];
  
  for (let i = 0; i < count; i++) {
    const isCompany = Math.random() > 0.7;
    customers.push({
      id: `CUST-${String(i + 1).padStart(4, '0')}`,
      name: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
      email: `customer${i + 1}@example.com`,
      phone: `+370${randomInt(60000000, 69999999)}`,
      country: randomElement(countries),
      city: 'City',
      address: 'Street Address',
      isCompany,
      companyName: isCompany ? `${randomElement(firstNames)} ${randomElement(lastNames)} Ltd.` : undefined,
      vatNumber: isCompany ? `LT${randomInt(100000000, 999999999)}` : undefined,
      viesValidated: isCompany ? Math.random() > 0.3 : undefined,
    });
  }
  
  return customers;
}

export function generateMockOrders(count: number = 100, parts: Part[], customers: Customer[]): Order[] {
  const orders: Order[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const customer = randomElement(customers);
    const itemCount = randomInt(1, 5);
    const items = [];
    let totalEUR = 0;
    let totalPLN = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const part = randomElement(parts);
      // Each part is individual, so quantity is always 1
      const quantity = 1;
      items.push({
        partId: part.id,
        partName: part.name,
        quantity,
        priceEUR: part.priceEUR,
        pricePLN: part.pricePLN,
        photo: part.photos[0],
      });
      totalEUR += part.priceEUR * quantity;
      totalPLN += part.pricePLN * quantity;
    }
    
    const shippingEUR = randomInt(10, 50);
    const shippingPLN = randomInt(50, 250);
    
    orders.push({
      id: `ORD-${String(i + 1).padStart(6, '0')}`,
      date: randomDate(new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), now),
      customerId: customer.id,
      customer,
      items,
      totalAmountEUR: totalEUR,
      totalAmountPLN: totalPLN,
      shippingCostEUR: shippingEUR,
      shippingCostPLN: shippingPLN,
      status: randomElement<OrderStatus>(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']),
      paymentMethod: randomElement(['Credit Card', 'Bank Transfer', 'PayPal', 'Cash on Delivery']),
      shippingStatus: randomElement(['Pending', 'In Transit', 'Delivered', 'Returned']),
      invoiceUrl: `https://example.com/invoices/${i + 1}.pdf`,
      shippingLabelUrl: `https://example.com/labels/${i + 1}.pdf`,
    });
  }
  
  return orders;
}

export function generateMockReturns(count: number = 20, orders: Order[]): Return[] {
  const returns: Return[] = [];
  const now = new Date();
  const completedOrders = orders.filter(o => o.status === 'Delivered');
  
  for (let i = 0; i < count && i < completedOrders.length; i++) {
    const order = randomElement(completedOrders);
    const returnItems = order.items.slice(0, randomInt(1, Math.min(order.items.length, 3)));
    
    let refundEUR = 0;
    let refundPLN = 0;
    
    const items = returnItems.map(item => {
      refundEUR += item.priceEUR * item.quantity;
      refundPLN += item.pricePLN * item.quantity;
      return {
        partId: item.partId,
        partName: item.partName,
        quantity: item.quantity,
        reason: randomElement(['Defective', 'Wrong Item', 'Not as Described', 'Customer Request']),
        priceEUR: item.priceEUR,
        pricePLN: item.pricePLN,
      };
    });
    
    returns.push({
      id: `RET-${String(i + 1).padStart(4, '0')}`,
      orderId: order.id,
      dateCreated: randomDate(order.date, now),
      customerId: order.customerId,
      customer: order.customer,
      items,
      refundableAmountEUR: refundEUR,
      refundableAmountPLN: refundPLN,
      status: randomElement<ReturnStatus>(['Requested', 'Approved', 'Refunded', 'Rejected']),
      creditNoteUrl: `https://example.com/credit-notes/${i + 1}.pdf`,
    });
  }
  
  return returns;
}

