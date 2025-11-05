import { FilterPanel } from '../filters/FilterPanel';
import { PartsInventoryTable } from './PartsInventoryTable';

export function PartsView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Parts Inventory</h1>
        <p className="text-muted-foreground">Manage and filter your parts inventory</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <FilterPanel />
        </div>
        <div className="lg:col-span-3">
          <PartsInventoryTable />
        </div>
      </div>
    </div>
  );
}





