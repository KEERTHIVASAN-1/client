import { useEffect } from "react";
import { useThemeStore } from "@/lib/store";

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const savedTheme = localStorage.getItem("hostel-theme");
    if (savedTheme) {
      const parsed = JSON.parse(savedTheme);
      if (parsed.state?.theme) {
        setTheme(parsed.state.theme);
      }
    } else {
      setTheme("dark");
    }
  }, [setTheme]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return <>{children}</>;
}
