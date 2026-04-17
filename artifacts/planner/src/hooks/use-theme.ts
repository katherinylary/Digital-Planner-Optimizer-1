import { useEffect, useState } from "react";

const THEME_KEY = "planner_theme";

export function useTheme() {
  const [theme, setTheme] = useState<"feminino" | "masculino">("feminino");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as "feminino" | "masculino" | null;
    if (saved) setTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme);

    const root = document.documentElement;

    if (theme === "masculino") {
      root.style.setProperty("--primary", "220 70% 55%"); // azul
    } else {
      root.style.setProperty("--primary", "340 70% 75%"); // rosa original
    }
  }, [theme]);

  return {
    theme,
    setTheme,
  };
}
