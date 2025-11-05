import { createSlice } from '@reduxjs/toolkit';
import { Part, Car, Order, Return } from '../../types';
import { generateMockCars, generateMockParts, generateMockCustomers, generateMockOrders, generateMockReturns } from '../../data/mockData';

interface DataState {
  parts: Part[];
  cars: Car[];
  orders: Order[];
  returns: Return[];
  initialized: boolean;
}

const initialState: DataState = {
  parts: [],
  cars: [],
  orders: [],
  returns: [],
  initialized: false,
};

const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {
    initializeData: (state) => {
      if (!state.initialized) {
        const cars = generateMockCars(50);
        const parts = generateMockParts(500, cars);
        const customers = generateMockCustomers(100);
        const orders = generateMockOrders(100, parts, customers);
        const returns = generateMockReturns(20, orders);

        state.cars = cars;
        state.parts = parts;
        state.orders = orders;
        state.returns = returns;
        state.initialized = true;
      }
    },
  },
});

export const { initializeData } = dataSlice.actions;
export default dataSlice.reducer;

