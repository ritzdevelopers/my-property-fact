"use client";

import * as React from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";

const AdminConfirmContext = React.createContext(null);

export function AdminConfirmProvider({ children }) {
  const [dialog, setDialog] = React.useState(null);

  const closeDialog = React.useCallback((result) => {
    setDialog((current) => {
      current?.resolve?.(result);
      return null;
    });
  }, []);

  const confirm = React.useCallback((options = {}) => {
    return new Promise((resolve) => {
      setDialog({
        mode: "confirm",
        title: options.title || "Please confirm",
        description: options.description || "",
        confirmText: options.confirmText || "Confirm",
        cancelText: options.cancelText || "Cancel",
        variant: options.variant || "default",
        resolve,
      });
    });
  }, []);

  const alert = React.useCallback((options = {}) => {
    return new Promise((resolve) => {
      setDialog({
        mode: "alert",
        title: options.title || "Notice",
        description: options.description || options.message || "",
        confirmText: options.confirmText || "Got it",
        variant: options.variant || "default",
        resolve,
      });
    });
  }, []);

  const handleConfirm = React.useCallback(async () => {
    if (dialog?.mode === "confirm") {
      closeDialog(true);
      return;
    }
    closeDialog(true);
  }, [closeDialog, dialog?.mode]);

  return (
    <AdminConfirmContext.Provider value={{ confirm, alert }}>
      {children}
      {dialog ? (
        <ConfirmDialog
          open
          onOpenChange={(open) => {
            if (!open) closeDialog(false);
          }}
          title={dialog.title}
          description={dialog.description}
          confirmText={dialog.confirmText}
          cancelText={dialog.cancelText}
          variant={dialog.variant}
          alertMode={dialog.mode === "alert"}
          onConfirm={handleConfirm}
          onCancel={() => closeDialog(false)}
        />
      ) : null}
    </AdminConfirmContext.Provider>
  );
}

export function useAdminConfirm() {
  const ctx = React.useContext(AdminConfirmContext);
  if (!ctx) {
    throw new Error("useAdminConfirm must be used within AdminConfirmProvider");
  }
  return ctx;
}

export default AdminConfirmProvider;
