import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { FilterState } from "../../types";

export const defaultFilters: FilterState = {
  search: "",
  status: "All",
  dateRange: {},
  carBrand: [],
  carModel: [],
  carYear: [],
  yearRange: {},
  fuelType: [],
  engineCapacityRange: undefined,
  gearbox: undefined,
  bodyType: [],
  partCategory: [],
  partType: [],
  quality: [],
  position: [],
  priceRange: {},
  inventoryAge: {},
  staleMonths: undefined,
  // Wheel-specific filters
  wheelDrive: undefined,
  wheelSide: undefined,
  wheelCentralDiameter: undefined,
  wheelFixingPoints: undefined,
  wheelHeight: undefined,
  wheelSpacing: undefined,
  wheelTreadDepth: undefined,
  wheelWidth: undefined,
  // Warehouse filter
  warehouse: undefined,
  // Sort by filter
  sortBy: undefined,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState: defaultFilters,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<FilterState>>) => {
      return { ...state, ...action.payload };
    },
    resetFilters: () => defaultFilters,
  },
});

export const { setFilters, resetFilters } = filtersSlice.actions;
export default filtersSlice.reducer;
