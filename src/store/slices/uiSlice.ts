import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ViewType = 'dashboard' | 'parts' | 'cars' | 'orders' | 'returns' | 'analytics';

interface UIState {
  selectedParts: string[];
  currentView: ViewType;
}

const initialState: UIState = {
  selectedParts: [],
  currentView: 'dashboard',
};

const uiSlice = createSlice({
  name: 'ui',
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
  },
});

export const { togglePartSelection, selectAllParts, clearSelection, setCurrentView } = uiSlice.actions;
export default uiSlice.reducer;

