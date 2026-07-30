"use client";

import { useAdminRole } from "@/app/(adminside)/admin/_contexts/AdminRoleContext";

/**
 * Conditionally renders children based on admin RBAC.
 * Super Admin always passes. Staff Admin must have the given permission key.
 *
 * @param {string} [permission] - Module permission key (e.g. MANAGE_BLOGS)
 * @param {boolean} [superAdminOnly] - Require Super Admin
 * @param {React.ReactNode} [fallback] - Optional fallback when denied
 */
export function PermissionGate({
  permission,
  superAdminOnly = false,
  fallback = null,
  children,
}) {
  const { loading, isSuperAdmin, hasPermission } = useAdminRole();

  if (loading) return fallback;

  if (superAdminOnly) {
    return isSuperAdmin ? children : fallback;
  }

  if (permission) {
    return isSuperAdmin || hasPermission(permission) ? children : fallback;
  }

  return children;
}

/**
 * Hook for imperative permission checks in page action handlers.
 */
export function useCan(permission, { superAdminOnly = false } = {}) {
  const { loading, isSuperAdmin, hasPermission } = useAdminRole();
  if (loading) return false;
  if (superAdminOnly) return isSuperAdmin;
  if (!permission) return true;
  return isSuperAdmin || hasPermission(permission);
}

export default PermissionGate;
