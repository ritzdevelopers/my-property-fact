"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@radix-ui/react-alert-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";

export function ConfirmDialog({
  open,
  onOpenChange,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "default",
  loading = false,
  alertMode = false,
  onConfirm,
  onCancel,
  children,
}) {
  const handleConfirm = async () => {
    await onConfirm?.();
    onOpenChange?.(false);
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  const variantStyles = {
    default: {
      icon: AlertTriangle,
      iconClass: "text-primary bg-primary/10",
      buttonVariant: "default",
    },
    destructive: {
      icon: Trash2,
      iconClass: "text-destructive bg-destructive/10",
      buttonVariant: "destructive",
    },
    warning: {
      icon: AlertTriangle,
      iconClass: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
      buttonVariant: "default",
    },
  };

  const config = variantStyles[variant];
  const Icon = config.icon;

  const accentClass = {
    default: "before:bg-gradient-to-r before:from-primary before:to-emerald-500",
    destructive: "before:bg-gradient-to-r before:from-red-500 before:to-rose-600",
    warning: "before:bg-gradient-to-r before:from-amber-400 before:to-orange-500",
  }[variant];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-[440px] overflow-hidden rounded-2xl",
          "before:absolute before:left-0 before:right-0 before:top-0 before:h-1 before:content-['']",
          accentClass
        )}
      >
        <DialogHeader className="flex flex-row items-start gap-4 pt-1">
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", config.iconClass)}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="space-y-1.5">
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </div>
        </DialogHeader>
        {children && <div className="mt-4">{children}</div>}
        <DialogFooter className="mt-6 gap-2 sm:gap-0">
          {!alertMode ? (
            <Button variant="outline" onClick={handleCancel} disabled={loading}>
              {cancelText}
            </Button>
          ) : null}
          <Button
            variant={config.buttonVariant}
            onClick={handleConfirm}
            disabled={loading}
            className={alertMode ? "w-full sm:w-auto" : undefined}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteConfirmDialog({
  open,
  onOpenChange,
  itemName,
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete item?"
      description={`Are you sure you want to delete ${itemName ? `"${itemName}"` : "this item"}? This action cannot be undone.`}
      confirmText="Delete"
      variant="destructive"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}

export default ConfirmDialog;
