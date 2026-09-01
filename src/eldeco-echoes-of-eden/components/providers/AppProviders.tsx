"use client";

import { type ReactNode } from "react";
import { EnquiryPopupProvider } from "@/eldeco-echoes-of-eden/context/EnquiryPopupContext";

export function AppProviders({ children }: { children: ReactNode }) {
  return <EnquiryPopupProvider>{children}</EnquiryPopupProvider>;
}
