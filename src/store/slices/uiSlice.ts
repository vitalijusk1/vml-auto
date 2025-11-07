import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ViewType =
  | "dashboard"
  | "parts"
  | "cars"
  | "orders"
  | "returns"
  | "analytics";

export interface CarsPagination {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

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
  carsPagination: CarsPagination | null;
  partsPagination: PartsPagination | null;
}

const initialState: UIState = {
  selectedParts: [],
  currentView: "dashboard",
  sidebarCollapsed: false,
  carsPagination: null,
  partsPagination: null,
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
    setCarsPagination: (state, action: PayloadAction<CarsPagination>) => {
      state.carsPagination = action.payload;
    },
    setPartsPagination: (state, action: PayloadAction<PartsPagination>) => {
      state.partsPagination = action.payload;
    },
  },
});

export const {
  togglePartSelection,
  selectAllParts,
  clearSelection,
  setCurrentView,
  toggleSidebar,
  setCarsPagination,
  setPartsPagination,
} = uiSlice.actions;
export default uiSlice.reducer;
