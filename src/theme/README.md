# Theme System Documentation

This directory contains the global theme configuration for the dashboard application. All colors, font sizes, and other design tokens are centralized here so they can be changed in one place and update throughout the application.

## Structure

- `theme.ts` - Main theme configuration object with all design tokens
- `utils.ts` - Helper functions for getting status colors and other theme utilities
- `README.md` - This documentation file

## Usage

### Colors

All colors are defined using CSS variables in `src/index.css` and can be accessed via Tailwind classes:

#### Status Colors
- `bg-status-success-bg/10 text-status-success-text` - Success states
- `bg-status-warning-bg/10 text-status-warning-text` - Warning states
- `bg-status-error-bg/10 text-status-error-text` - Error states
- `bg-status-info-bg/10 text-status-info-text` - Info states
- `bg-status-neutral-bg/10 text-status-neutral-text` - Neutral states

#### Metrics Colors
- `bg-metrics-primary-bg/10 text-metrics-primary-text` - Primary metric
- `bg-metrics-secondary-bg/10 text-metrics-secondary-text` - Secondary metric
- `bg-metrics-tertiary-bg/10 text-metrics-tertiary-text` - Tertiary metric
- `bg-metrics-revenue-bg/10 text-metrics-revenue-text` - Revenue metric
- `bg-metrics-warning-bg/10 text-metrics-warning-text` - Warning metric
- `bg-metrics-danger-bg/10 text-metrics-danger-text` - Danger metric

#### Inventory Colors
- `text-inventory-new` - New inventory items
- `text-inventory-normal` - Normal inventory items
- `text-inventory-warning` - Warning inventory items
- `text-inventory-critical` - Critical inventory items

### Helper Functions

#### `getStatusBadgeClass(entityType, status)`
Returns the appropriate Tailwind classes for status badges based on entity type and status.

Example:
```typescript
import { getStatusBadgeClass } from '@/theme/utils';

const statusClass = getStatusBadgeClass('car', 'Purchased');
// Returns: 'bg-status-info-bg/10 text-status-info-text'
```

## Changing Theme Colors

To change colors globally:

1. Open `src/index.css`
2. Modify the CSS variables in the `:root` section for light mode
3. Modify the CSS variables in the `.dark` section for dark mode
4. All components using these colors will automatically update

Example:
```css
:root {
  --status-success-bg: 142 76% 36%; /* Change this to modify success color */
  --status-success-text: 142 76% 36%;
}
```

## Theme Configuration

The `theme.ts` file contains the theme configuration object. While colors are primarily managed via CSS variables, you can also reference the theme object programmatically:

```typescript
import { theme } from '@/theme/theme';

// Access chart colors
const chartColor = theme.colors.charts.primary; // "#0088FE"
```

## Status Color Mappings

Status colors are mapped by entity type in `theme.ts`:

- **Car**: Purchased (info), For Dismantling (warning), Dismantled (success), Sold (neutral)
- **Part**: In Stock (success), Reserved (warning), Sold (info), Returned (neutral)
- **Order**: Pending (warning), Processing (info), Shipped (info), Delivered (success), Cancelled (error)
- **Return**: Requested (warning), Approved (info), Refunded (success), Rejected (error)

