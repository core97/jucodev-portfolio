import { THEME_MODE } from "@/constants/theme";
import { HTML_SELECTORS } from "@/constants/html-selectors";

function toggleTheme(themeMode: string) {
  const STORAGE_KEY = "theme";

  const root = document.querySelector(":root");
  let newTheme: string | undefined;

  if (!root) return;

  if ([THEME_MODE.DARK, THEME_MODE.LIGHT].includes(themeMode)) {
    newTheme = themeMode;
    window.localStorage[STORAGE_KEY] = themeMode;
  } else if (themeMode === THEME_MODE.OS) {
    newTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
      ? THEME_MODE.DARK
      : THEME_MODE.LIGHT;
    window.localStorage.removeItem(STORAGE_KEY);
  }

  if (newTheme === THEME_MODE.DARK) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function preloadTheme() {
  const userTheme = localStorage.theme;

  if (userTheme === THEME_MODE.LIGHT || userTheme === THEME_MODE.DARK) {
    toggleTheme(userTheme);
  } else {
    toggleTheme(THEME_MODE.OS);
  }
}

export function addEventListenerThemeButtons() {
  const lightThemeButton = document.getElementById(
    HTML_SELECTORS.BUTTON_LIGHT_THEME
  );
  lightThemeButton?.addEventListener("click", () => {
    toggleTheme(THEME_MODE.LIGHT);
  });

  const darkThemeButton = document.getElementById(
    HTML_SELECTORS.BUTTON_DARK_THEME
  );
  darkThemeButton?.addEventListener("click", () => {
    toggleTheme(THEME_MODE.DARK);
  });

  const osThemeButton = document.getElementById(HTML_SELECTORS.BUTTON_OS_THEME);
  osThemeButton?.addEventListener("click", () => {
    toggleTheme(THEME_MODE.OS);
  });
}
