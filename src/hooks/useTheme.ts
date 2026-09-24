 
import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "admin_theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem(
      THEME_KEY
    ) as Theme | null;

    const initialTheme =
      savedTheme === "dark"
        ? "dark"
        : "light";

    setThemeState(initialTheme);

    document.documentElement.classList.toggle(
      "dark",
      initialTheme === "dark"
    );
  }, []);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);

    localStorage.setItem(
      THEME_KEY,
      nextTheme
    );

    document.documentElement.classList.toggle(
      "dark",
      nextTheme === "dark"
    );
  };

  const toggleTheme = () => {
    setTheme(
      theme === "dark"
        ? "light"
        : "dark"
    );
  };

  return {
    theme,
    setTheme,
    toggleTheme,
  };
}
 
