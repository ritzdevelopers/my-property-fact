"use client";

import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { useEnquiryPopup } from "@/eldeco-echoes-of-eden/context/EnquiryPopupContext";

type EnquiryPopupTriggerProps = {
  children: ReactNode;
  className?: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "onClick">;

export function EnquiryPopupTrigger({
  children,
  className,
  ...props
}: EnquiryPopupTriggerProps) {
  const { openEnquiryPopup } = useEnquiryPopup();

  return (
    <button
      type="button"
      className={className}
      onClick={openEnquiryPopup}
      {...props}
    >
      {children}
    </button>
  );
}
