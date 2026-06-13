"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";

const statusConfig = {
  active: {
    label: "Active",
    variant: "success",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  inactive: {
    label: "Inactive",
    variant: "secondary",
    icon: XCircle,
    className: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400",
  },
  pending: {
    label: "Pending",
    variant: "warning",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  approved: {
    label: "Approved",
    variant: "success",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: XCircle,
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  draft: {
    label: "Draft",
    variant: "outline",
    icon: AlertTriangle,
    className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  },
  published: {
    label: "Published",
    variant: "success",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
};

export function StatusBadge({ status, showIcon = true, className }) {
  const config = statusConfig[status] || statusConfig.inactive;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {showIcon && Icon && <Icon className="h-3 w-3 mr-1" />}
      {config.label}
    </Badge>
  );
}

export function StatusToggle({
  checked,
  onCheckedChange,
  disabled = false,
  loading = false,
  size = "default",
  showLabel = true,
  className,
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled || loading}
          className={cn(
            size === "sm" && "h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:data-[state=checked]:translate-x-3"
          )}
        />
      )}
      {showLabel && (
        <Label
          className={cn(
            "text-xs font-medium cursor-pointer",
            checked ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
          )}
        >
          {checked ? "Active" : "Inactive"}
        </Label>
      )}
    </div>
  );
}

export function ContentStatusPill({ status, className }) {
  const isActive = status === 1 || status === true || status === "active";
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        isActive
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        className
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isActive ? "bg-green-500" : "bg-gray-400"
        )}
      />
      {isActive ? "Active" : "Inactive"}
    </div>
  );
}

export default StatusBadge;
