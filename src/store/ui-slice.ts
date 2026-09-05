import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type UiState = {
  isChannelListOpen: boolean;
  toastMessage: string | null;
};

const initialState: UiState = {
  isChannelListOpen: false,
  toastMessage: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setChannelListOpen(state, action: PayloadAction<boolean>) {
      state.isChannelListOpen = action.payload;
    },
    showToast(state, action: PayloadAction<string>) {
      state.toastMessage = action.payload;
    },
    clearToast(state) {
      state.toastMessage = null;
    },
  },
});

export const { clearToast, setChannelListOpen, showToast } = uiSlice.actions;
export default uiSlice.reducer;
