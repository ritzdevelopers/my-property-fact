"use client";

import * as React from "react";
import { AdminLayout } from "./admin-layout";
import { useAdminRole } from "@/app/(adminside)/admin/_contexts/AdminRoleContext";

export function AdminShell({ children }) {
  const { isSuperAdmin, hasPermission, displayName, roleLabel } = useAdminRole();

  const user = {
    name: displayName || "Admin User",
    role: roleLabel || "Admin",
    email: "",
  };

  return (
    <AdminLayout
      user={user}
      isSuperAdmin={isSuperAdmin}
      hasPermission={hasPermission}
      theme="light"
    >
      {children}
    </AdminLayout>
  );
}

export default AdminShell;
