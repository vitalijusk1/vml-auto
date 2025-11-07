import { createSlice } from "@reduxjs/toolkit";
import { Part, Order, Return } from "../../types";

interface DataState {
  parts: Part[];
  orders: Order[];
  returns: Return[];
}

const initialState: DataState = {
  parts: [],
  orders: [],
  returns: [],
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
  },
});

export const { setParts, setOrders, setReturns } = dataSlice.actions;
export default dataSlice.reducer;
