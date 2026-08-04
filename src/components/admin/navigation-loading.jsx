"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AdminLoader } from "@/components/admin/admin-loader";

const NavLoadingContext = React.createContext({ startNavigation: () => {} });

export function useNavLoading() {
  return React.useContext(NavLoadingContext);
}

function NavLoadingOverlay() {
  return (
    <div className="mpf-navload" role="status" aria-live="polite" aria-busy="true">
      <div className="mpf-navload__inner">
        <AdminLoader label="Loading…" size="lg" />
      </div>
    </div>
  );
}

export function NavLoadingProvider({ children }) {
  const pathname = usePathname();
  const [loading, setLoading] = React.useState(false);
  const timeoutRef = React.useRef(null);

  const clearTimer = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    setLoading(false);
    clearTimer();
  }, [pathname, clearTimer]);

  React.useEffect(() => () => clearTimer(), [clearTimer]);

  const startNavigation = React.useCallback(
    (href) => {
      if (!href || href === pathname) return;
      setLoading(true);
      clearTimer();
      timeoutRef.current = setTimeout(() => setLoading(false), 12000);
    },
    [pathname, clearTimer]
  );

  return (
    <NavLoadingContext.Provider value={{ startNavigation }}>
      {children}
      {loading ? <NavLoadingOverlay /> : null}
    </NavLoadingContext.Provider>
  );
}

export default NavLoadingProvider;
