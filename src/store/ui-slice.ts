import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_THEME, type ThemeState } from "@/lib/theme";

type UiState = {
  isChannelListOpen: boolean;
  toastMessage: string | null;
  theme: ThemeState;
};

const initialState: UiState = {
  isChannelListOpen: false,
  toastMessage: null,
  theme: DEFAULT_THEME,
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
    setTheme(state, action: PayloadAction<ThemeState>) {
      state.theme = action.payload;
    },
    setThemeMode(state, action: PayloadAction<ThemeState["mode"]>) {
      state.theme.mode = action.payload;
    },
    setThemeAccent(state, action: PayloadAction<ThemeState["accent"]>) {
      state.theme.accent = action.payload;
    },
  },
});

export const {
  clearToast,
  setChannelListOpen,
  setTheme,
  setThemeAccent,
  setThemeMode,
  showToast,
} = uiSlice.actions;
export default uiSlice.reducer;
