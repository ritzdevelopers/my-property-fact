"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PageHeader } from "./page-header";

/**
 * Standard admin page shell: breadcrumbs, title, white content card.
 */
export function AdminPage({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  className,
  contentClassName,
  bare = false,
}) {
  return (
    <div className={cn("admin-page space-y-4", className)}>
      {(title || breadcrumbs) && (
        <PageHeader
          title={title}
          description={description}
          breadcrumbs={breadcrumbs}
          actions={actions}
        />
      )}
      {bare ? (
        children
      ) : (
        <div className={cn("admin-content-card", contentClassName)}>{children}</div>
      )}
    </div>
  );
}

export default AdminPage;
