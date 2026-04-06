"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getPublicApiBase } from "@/lib/publicApiBase";

const AdminRoleContext = createContext({
  loading: true,
  roles: [],
  permissions: [],
  displayName: "",
  roleLabel: "",
  isSuperAdmin: false,
  isAdmin: false,
  /** Admin (non–super-admin) staff */
  isAdminOnly: false,
  hasPermission: () => false,
});

function formatRoleLabel(normalizedRoles) {
  const r = normalizedRoles || [];
  if (r.includes("SUPERADMIN")) return "Super Admin";
  if (r.includes("ADMIN")) return "Admin";
  if (r.includes("USER")) return "User";
  if (!r.length) return "";
  return r
    .map((x) => x.charAt(0) + x.slice(1).toLowerCase())
    .join(", ");
}

function normalizeRoles(roles) {
  if (!roles || !Array.isArray(roles)) return [];
  return roles.map((r) =>
    String(r || "")
      .replace(/^ROLE_/i, "")
      .toUpperCase(),
  );
}

export function AdminRoleProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [displayName, setDisplayName] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const base = getPublicApiBase();
      if (!base) {
        if (!cancelled) {
          setRoles([]);
          setPermissions([]);
          setDisplayName("");
          setLoading(false);
        }
        return;
      }
      try {
        const res = await fetch(`${base}auth/session`, {
          credentials: "include",
        });
        if (!res.ok) {
          if (!cancelled) {
            setRoles([]);
            setPermissions([]);
            setDisplayName("");
            setLoading(false);
          }
          return;
        }
        const data = await res.json();
        const list = normalizeRoles(data.roles);
        const permList = Array.isArray(data.permissions)
          ? data.permissions.map((p) => String(p || "").toUpperCase())
          : [];
        const name =
          (typeof data.fullName === "string" && data.fullName.trim()) ||
          (typeof data.dashboardUsername === "string" &&
            data.dashboardUsername.trim()) ||
          (typeof data.email === "string" && data.email.split("@")[0]) ||
          "";
        if (!cancelled) {
          setRoles(list);
          setPermissions(permList);
          setDisplayName(name);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setRoles([]);
          setPermissions([]);
          setDisplayName("");
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(() => {
    const isSuperAdmin = roles.includes("SUPERADMIN");
    const isAdmin = roles.includes("ADMIN");
    const isAdminOnly = isAdmin && !isSuperAdmin;
    const permSet = new Set(permissions);
    const hasPermission = (key) => {
      if (!key) return false;
      if (isSuperAdmin) return true;
      return permSet.has(String(key).toUpperCase());
    };
    const roleLabel = formatRoleLabel(roles);
    return {
      loading,
      roles,
      permissions,
      displayName,
      roleLabel,
      isSuperAdmin,
      isAdmin,
      isAdminOnly,
      hasPermission,
    };
  }, [loading, roles, permissions, displayName]);

  return (
    <AdminRoleContext.Provider value={value}>
      {children}
    </AdminRoleContext.Provider>
  );
}

export function useAdminRole() {
  return useContext(AdminRoleContext);
}
