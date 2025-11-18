import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ViewType =
  | "dashboard"
  | "parts"
  | "orders"
  | "returns"
  | "analytics"
  | "order-control";

export interface PartsPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

interface UIState {
  selectedParts: string[];
  currentView: ViewType;
  sidebarCollapsed: boolean;
  partsPagination: PartsPagination | null;
  orderControlSelectedCarId: string;
}

const initialState: UIState = {
  selectedParts: [],
  currentView: "dashboard",
  sidebarCollapsed: false,
  partsPagination: null,
  orderControlSelectedCarId: "",
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    togglePartSelection: (state, action: PayloadAction<string>) => {
      const partId = action.payload;
      if (state.selectedParts.includes(partId)) {
        state.selectedParts = state.selectedParts.filter((id) => id !== partId);
      } else {
        state.selectedParts.push(partId);
      }
    },
    selectAllParts: (state, action: PayloadAction<string[]>) => {
      state.selectedParts = action.payload;
    },
    clearSelection: (state) => {
      state.selectedParts = [];
    },
    setCurrentView: (state, action: PayloadAction<ViewType>) => {
      state.currentView = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setPartsPagination: (state, action: PayloadAction<PartsPagination>) => {
      state.partsPagination = action.payload;
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
  togglePartSelection,
  selectAllParts,
  clearSelection,
  setCurrentView,
  toggleSidebar,
  setPartsPagination,
  setOrderControlSelectedCarId,
  clearOrderControlSelectedCarId,
} = uiSlice.actions;
export default uiSlice.reducer;
