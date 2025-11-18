import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Part, Order, Return, Car } from "../../types";
import { CarFilters } from "../../utils/filterCars";

interface DataState {
  parts: Part[];
  orders: Order[];
  returns: Return[];
  cars: Car[];
  backendFilters: CarFilters | null;
}

const initialState: DataState = {
  parts: [],
  orders: [],
  returns: [],
  cars: [],
  backendFilters: null,
};

const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    setParts: (state, action) => {
      state.parts = action.payload;
    },
    setOrders: (state, action) => {
      state.orders = action.payload;
    },
    setReturns: (state, action) => {
      state.returns = action.payload;
    },
    setCars: (state, action: PayloadAction<Car[]>) => {
      state.cars = action.payload;
    },
    setBackendFilters: (state, action: PayloadAction<CarFilters>) => {
      state.backendFilters = action.payload;
    },
  },
});

export const { setParts, setOrders, setReturns, setCars, setBackendFilters } = dataSlice.actions;
export default dataSlice.reducer;
