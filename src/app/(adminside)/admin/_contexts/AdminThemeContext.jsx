"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "mpf-admin-dashboard-theme";

/** Theme commits while wave overlay covers the viewport. */
const WAVE_THEME_SWAP_MS = 810;
const WAVE_CLEANUP_MS = 1700;

const AdminThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function AdminThemeProvider({ children }) {
  const [theme, setThemeState] = useState("light");
  const [mounted, setMounted] = useState(false);
  const themeRef = useRef("light");
  const waveBusyRef = useRef(false);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "dark" || stored === "light") {
        setThemeState(stored);
        themeRef.current = stored;
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute(
      "data-admin-theme",
      mounted ? theme : "light",
    );
  }, [theme, mounted]);

  useEffect(() => {
    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.removeAttribute("data-admin-theme");
        document.body.classList.remove(
          "admin-theme-wave-transition",
          "admin-theme-wave-transition--run",
        );
        document.body.removeAttribute("data-admin-wave-to");
      }
    };
  }, []);

  const setTheme = useCallback((next) => {
    const t = next === "dark" ? "dark" : "light";
    themeRef.current = t;
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleTheme = useCallback(() => {
    if (waveBusyRef.current) return;

    const prev = themeRef.current;
    const next = prev === "dark" ? "light" : "dark";

    if (typeof document === "undefined") {
      setTheme(next);
      return;
    }

    waveBusyRef.current = true;
    document.body.setAttribute("data-admin-wave-to", next);
    document.body.classList.add("admin-theme-wave-transition");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.body.classList.add("admin-theme-wave-transition--run");
      });
    });

    window.setTimeout(() => {
      themeRef.current = next;
      setThemeState(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
    }, WAVE_THEME_SWAP_MS);

    window.setTimeout(() => {
      document.body.classList.remove(
        "admin-theme-wave-transition",
        "admin-theme-wave-transition--run",
      );
      document.body.removeAttribute("data-admin-wave-to");
      waveBusyRef.current = false;
    }, WAVE_CLEANUP_MS);
  }, [setTheme]);

  const value = useMemo(
    () => ({ theme: mounted ? theme : "light", setTheme, toggleTheme }),
    [theme, mounted, setTheme, toggleTheme],
  );

  return (
    <AdminThemeContext.Provider value={value}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}
