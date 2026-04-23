import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  colours: typeof lightColours;
}

const lightColours = {
  primary: "#4A90E2",
  success: "#2ECC71",
  danger: "#E74C3C",
  warning: "#F39C12",
  purple: "#9B59B6",
  background: "#F5F7FA",
  card: "#FFFFFF",
  text: "#2C3E50",
  textLight: "#95A5A6",
  border: "#ECF0F1",
  tabBar: "#FFFFFF",
};

const darkColours = {
  primary: "#4A90E2",
  success: "#2ECC71",
  danger: "#E74C3C",
  warning: "#F39C12",
  purple: "#9B59B6",
  background: "#1A1A2E",
  card: "#16213E",
  text: "#EAEAEA",
  textLight: "#888",
  border: "#2A2A4A",
  tabBar: "#16213E",
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  colours: lightColours,
});

export function ThemeProvider({ children }: { children: any }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    AsyncStorage.getItem("theme").then((saved) => {
      if (saved === "dark" || saved === "light") setTheme(saved);
    });
  }, []);

  const toggleTheme = async () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    await AsyncStorage.setItem("theme", next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
        colours: theme === "light" ? lightColours : darkColours,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);