"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { enquiryPopupConfig } from "@/eldeco-echoes-of-eden/config/enquiryPopup";
import { EnquiryPopup } from "@/eldeco-echoes-of-eden/components/EnquiryPopup";

type EnquiryPopupContextValue = {
  isOpen: boolean;
  openEnquiryPopup: () => void;
  closeEnquiryPopup: () => void;
};

const EnquiryPopupContext = createContext<EnquiryPopupContextValue | null>(null);

function isAutoShowDismissed() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(enquiryPopupConfig.sessionStorageKey) === "true";
}

function markAutoShowDismissed() {
  sessionStorage.setItem(enquiryPopupConfig.sessionStorageKey, "true");
}

export function EnquiryPopupProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const autoShowScheduled = useRef(false);

  const openEnquiryPopup = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeEnquiryPopup = useCallback(() => {
    setIsOpen(false);
    markAutoShowDismissed();
  }, []);

  useEffect(() => {
    if (isAutoShowDismissed() || autoShowScheduled.current) return;

    autoShowScheduled.current = true;

    const timer = window.setTimeout(() => {
      if (!isAutoShowDismissed()) {
        setIsOpen(true);
      }
    }, enquiryPopupConfig.autoShowDelayMs);

    return () => window.clearTimeout(timer);
  }, []);

  const value = useMemo(
    () => ({
      isOpen,
      openEnquiryPopup,
      closeEnquiryPopup,
    }),
    [isOpen, openEnquiryPopup, closeEnquiryPopup],
  );

  return (
    <EnquiryPopupContext.Provider value={value}>
      {children}
      <EnquiryPopup
        isOpen={isOpen}
        onClose={closeEnquiryPopup}
      />
    </EnquiryPopupContext.Provider>
  );
}

export function useEnquiryPopup() {
  const context = useContext(EnquiryPopupContext);

  if (!context) {
    throw new Error("useEnquiryPopup must be used within EnquiryPopupProvider");
  }

  return context;
}
