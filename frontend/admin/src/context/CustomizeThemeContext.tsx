import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { THEMES } from "@/constants/themes";

type ThemeMode = "light" | "dark" | "system";

interface ThemeSettings {
  color: string;
  borderRadius: string;
  mode: ThemeMode;
}

interface ThemeContextType {
  theme: ThemeSettings;
  setTheme: (newTheme: Partial<ThemeSettings>) => void;
  setMode: (mode: ThemeMode) => void;
}

const defaultTheme: ThemeSettings = {
  color: "Default",
  borderRadius: "0.65rem",
  mode: "system",
};

const ThemeContext = createContext<ThemeContextType>({
  theme: defaultTheme,
  setTheme: () => {},
  setMode: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeSettings>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("customTheme");
      return stored ? JSON.parse(stored) : defaultTheme;
    }
    return defaultTheme;
  });

  // Apply color and border radius
  const applyColorTheme = (color: string, borderRadius: string) => {
    const root = document.documentElement;
    const themeVars = THEMES[color]?.light || THEMES.Default.light;

    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value as string);
    });

    root.style.setProperty("--radius", borderRadius);
  };

  // Apply dark/light/system mode
  const applyMode = (mode: ThemeMode) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const effectiveMode = mode === "system" ? (systemPrefersDark ? "dark" : "light") : mode;

    root.classList.add(effectiveMode);
  };

  const setTheme = (newTheme: Partial<ThemeSettings>) => {
    const updated = { ...theme, ...newTheme };
    setThemeState(updated);
    localStorage.setItem("customTheme", JSON.stringify(updated));

    applyColorTheme(updated.color, updated.borderRadius);
    applyMode(updated.mode);
  };

  const setMode = (mode: ThemeMode) => setTheme({ mode });

  // Apply theme and mode on mount
  useEffect(() => {
    applyColorTheme(theme.color, theme.borderRadius);
    applyMode(theme.mode);

    // Listen to system theme changes if mode is "system"
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme.mode === "system") applyMode("system");
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
};
