import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ViewType = "parts" | "orders" | "returns" | "analytics" | "order-control";

interface UIState {
  currentView: ViewType;
  sidebarCollapsed: boolean;
  orderControlSelectedCarId: string;
}

const initialState: UIState = {
  currentView: "parts",
  sidebarCollapsed: false,
  orderControlSelectedCarId: "",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setCurrentView: (state, action: PayloadAction<ViewType>) => {
      state.currentView = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setOrderControlSelectedCarId: (state, action: PayloadAction<string>) => {
      state.orderControlSelectedCarId = action.payload;
    },
    clearOrderControlSelectedCarId: (state) => {
      state.orderControlSelectedCarId = "";
    },
  },
});

export const {
  setCurrentView,
  toggleSidebar,
  setOrderControlSelectedCarId,
  clearOrderControlSelectedCarId,
} = uiSlice.actions;
export default uiSlice.reducer;
