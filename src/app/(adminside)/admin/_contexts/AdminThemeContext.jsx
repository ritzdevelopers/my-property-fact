"use client";

import { createContext, useContext, useEffect, useMemo } from "react";

const AdminThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function AdminThemeProvider({ children }) {
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-admin-theme", "light");
    return () => {
      document.documentElement.removeAttribute("data-admin-theme");
    };
  }, []);

  const setTheme = () => {};
  const toggleTheme = () => {};

  const value = useMemo(
    () => ({ theme: "light", setTheme, toggleTheme }),
    [],
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
