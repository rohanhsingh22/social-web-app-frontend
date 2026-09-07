"use client";

import { Provider as ReduxProvider } from "react-redux";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { store } from "@/store/store";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </ReduxProvider>
  );
}
