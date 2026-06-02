import React, { createContext, useContext } from "react";
import { useColorScheme } from "react-native";

type Theme = {
  dark: boolean;
  colors: {
    primary: string;
    background: string;
    card: string;
    text: string;
    subtext: string;
    border: string;
    inputBg: string;
    headerBg: string;
    darkCard: string;
    placeholder: string;
  };
};

const lightTheme: Theme = {
  dark: false,
  colors: {
    primary: "#007AFF",
    background: "#f5f5f5",
    card: "#ffffff",
    text: "#1a1a1a",
    subtext: "#888888",
    border: "rgba(0,0,0,0.08)",
    inputBg: "rgba(0,0,0,0.06)",
    headerBg: "#f5f5f5",
    darkCard: "#1a1a2e",
    placeholder: "rgba(0,0,0,0.35)",
  },
};

const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: "#007AFF",
    background: "#0d0d0d",
    card: "#1c1c1e",
    text: "#ffffff",
    subtext: "#aaaaaa",
    border: "rgba(255,255,255,0.1)",
    inputBg: "rgba(255,255,255,0.08)",
    headerBg: "#0d0d0d",
    darkCard: "#1c1c1e",
    placeholder: "rgba(255,255,255,0.35)",
  },
};

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const theme = scheme === "dark" ? darkTheme : lightTheme;
  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
