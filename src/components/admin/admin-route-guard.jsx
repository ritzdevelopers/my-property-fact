"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAdminRole } from "@/app/(adminside)/admin/_contexts/AdminRoleContext";
import { canAccessAdminPath } from "@/app/(adminside)/admin/adminPermissions";

/**
 * Client-side route guard mirroring middleware canAccessAdminPath.
 * Blocks direct URL navigation when permissions are insufficient.
 */
export function AdminRouteGuard({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { loading, roles, permissions, isSuperAdmin, isAdmin } = useAdminRole();

  useEffect(() => {
    if (loading) return;
    if (!pathname?.startsWith("/admin/dashboard")) return;

    // Portal users / unauthenticated should not linger on admin pages
    if (!isSuperAdmin && !isAdmin) {
      router.replace("/admin");
      return;
    }

    const access = canAccessAdminPath(roles, permissions, pathname);
    if (!access.ok) {
      router.replace(access.redirect || "/admin/dashboard");
    }
  }, [loading, pathname, roles, permissions, isSuperAdmin, isAdmin, router]);

  return children;
}

export default AdminRouteGuard;
