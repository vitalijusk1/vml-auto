import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FilterState } from '../../types';

const defaultFilters: FilterState = {
  search: '',
  status: 'All',
  dateRange: {},
  carBrand: [],
  carModel: [],
  carYear: [],
  fuelType: [],
  bodyType: [],
  partCategory: [],
  partType: [],
  quality: [],
  position: [],
  priceRange: {},
  inventoryAge: {},
};

const filtersSlice = createSlice({
  name: 'filters',
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

