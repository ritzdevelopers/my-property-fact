"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";

const NavLoadingContext = React.createContext({ startNavigation: () => {} });

export function useNavLoading() {
  return React.useContext(NavLoadingContext);
}

function NavLoadingOverlay() {
  return (
    <div className="mpf-navload" role="status" aria-live="polite" aria-busy="true">
      <div className="mpf-navload__card">
        <div className="mpf-navload__icon">
          <Building2 strokeWidth={1.75} />
          <span className="mpf-navload__pulse" />
        </div>
        <p className="mpf-navload__title">Loading workspace…</p>
        <div className="mpf-navload__bar">
          <span />
        </div>
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

  // When the route actually changes, the new page has begun rendering — hide.
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
      // Safety net so the overlay never gets stuck.
      timeoutRef.current = setTimeout(() => setLoading(false), 12000);
    },
    [pathname, clearTimer]
  );

  return (
    <NavLoadingContext.Provider value={{ startNavigation }}>
      {children}
      {loading && <NavLoadingOverlay />}
    </NavLoadingContext.Provider>
  );
}

export default NavLoadingProvider;
