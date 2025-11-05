# RRR Car Parts Inventory Dashboard

A comprehensive car parts inventory management dashboard for a car dismantling and parts selling company. The system manages cars, parts inventory, orders, and returns with multi-currency support.

## Features

### Core Features
- **Dashboard Overview**: Metrics cards showing key inventory statistics
- **Parts Inventory Management**: Advanced table with filtering, sorting, and pagination
- **Car Inventory Management**: View and manage cars in various states
- **Orders Management**: Track active, completed, and cancelled orders
- **Returns Management**: Process returns and refunds
- **Analytics Dashboard**: Visual charts for sales performance and inventory health
- **Top Performers**: Identify best-selling parts with configurable limits (Top 10/50/100)
- **Stale Inventory Alerts**: Identify parts that haven't sold in 6+ months
- **Advanced Filtering**: Multi-criteria filtering with real-time updates

### Technical Features
- **React + TypeScript**: Modern, type-safe development
- **TanStack Table**: Advanced table features (sorting, filtering, pagination, column visibility)
- **Recharts**: Beautiful data visualization charts
- **Zustand**: State management with persistence
- **Tailwind CSS + Shadcn/ui**: Modern, accessible UI components
- **Mock Data**: 500+ parts, 50+ cars, 100+ orders, 20+ returns

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the dashboard directory:
```bash
cd dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Project Structure

```
dashboard/
├── src/
│   ├── components/
│   │   ├── analytics/      # Analytics charts and views
│   │   ├── cars/            # Car inventory components
│   │   ├── dashboard/       # Dashboard overview components
│   │   ├── filters/         # Filter panel components
│   │   ├── layout/          # Layout components (Sidebar, Header)
│   │   ├── orders/          # Order management components
│   │   ├── parts/           # Parts inventory components
│   │   ├── returns/         # Returns management components
│   │   └── ui/              # Reusable UI components (Shadcn/ui)
│   ├── data/
│   │   └── mockData.ts      # Mock data generators
│   ├── lib/
│   │   └── utils.ts         # Utility functions
│   ├── store/
│   │   └── useStore.ts      # Zustand store with state management
│   ├── types/
│   │   └── index.ts         # TypeScript type definitions
│   ├── App.tsx              # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
```

## Key Components

### Dashboard View
- **MetricsCards**: Displays key metrics (total parts, revenue, stale inventory)
- **StaleInventoryAlert**: Highlights parts that haven't sold in 6+ months
- **TopPerformersSection**: Shows best-selling parts with card/table views
- **PartsInventoryTable**: Main parts inventory table with advanced features

### Filter Panel
Comprehensive filtering options:
- Search (part name, codes, manufacturer)
- Status (In Stock, Reserved, Sold, Returned)
- Car filters (Brand, Model, Year, Fuel Type, Body Type)
- Part filters (Category, Type, Quality, Position)
- Price range
- Inventory age (Stale/New quick filters)

### Parts Inventory Table
Features:
- Multi-column sorting
- Column filtering
- Pagination (50 items per page)
- Row selection (checkboxes)
- Bulk actions
- Part detail modal
- Export capabilities

### Analytics
Charts include:
- Sales performance over time (line chart)
- Revenue by category (bar chart)
- Sales distribution by car brand (pie chart)
- Inventory age distribution (bar chart)
- Parts by status (bar chart)

## State Management

The application uses Zustand for state management with localStorage persistence for:
- Filter state
- Current view
- Selected parts

## Mock Data

The application generates realistic mock data on initialization:
- **500+ parts** with varied attributes
- **50+ cars** in various states
- **100+ orders** with different statuses
- **20+ returns** linked to orders

## Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - UI component library
- **TanStack Table** - Table functionality
- **Recharts** - Chart library
- **Zustand** - State management
- **date-fns** - Date formatting
- **Lucide React** - Icons

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

- [ ] Export to CSV/Excel functionality
- [ ] Real-time updates with WebSocket
- [ ] User authentication and authorization
- [ ] Backend API integration
- [ ] Image upload and management
- [ ] Advanced reporting
- [ ] Email notifications
- [ ] Mobile app

## License

This project is proprietary software for RRR Car Parts.
