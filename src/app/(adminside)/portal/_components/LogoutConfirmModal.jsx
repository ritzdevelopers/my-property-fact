"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LogOut } from "lucide-react";
import "./LogoutConfirmModal.css";

export default function LogoutConfirmModal({
  open,
  onCancel,
  onConfirm,
  busy = false,
  title = "Log out of Broker Portal?",
  message = "You'll be signed out and taken back to the My Property Fact homepage.",
  confirmLabel = "Log Out",
}) {
  const [mounted, setMounted] = useState(false);
  const cancelRef = useRef(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (e) => {
      if (e.key === "Escape" && !busy) onCancel?.();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    cancelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, busy, onCancel]);

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="brk-logout-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel?.();
      }}
    >
      <div
        className="brk-logout-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="brk-logout-title"
        aria-describedby="brk-logout-desc"
      >
        <span className="brk-logout-modal__icon" aria-hidden>
          <LogOut size={22} />
        </span>

        <h2 id="brk-logout-title" className="brk-logout-modal__title">
          {title}
        </h2>
        <p id="brk-logout-desc" className="brk-logout-modal__text">
          {message}
        </p>

        <div className="brk-logout-modal__actions">
          <button
            type="button"
            ref={cancelRef}
            className="brk-logout-btn brk-logout-btn--ghost"
            onClick={onCancel}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="brk-logout-btn brk-logout-btn--danger"
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Logging out…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
