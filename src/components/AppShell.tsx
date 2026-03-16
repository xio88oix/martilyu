"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import NavBar from "./NavBar";
import ReduxProvider from "@/store/ReduxProvider";

const theme = createTheme();

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NavBar />
        <main style={{ padding: "1rem" }}>{children}</main>
      </ThemeProvider>
    </ReduxProvider>
  );
}
