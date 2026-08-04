"use client";
import { Suspense } from "react";
import { AdminRoleProvider } from "../_contexts/AdminRoleContext";
import { AdminThemeProvider } from "../_contexts/AdminThemeContext";
import { AdminToastProvider } from "../_contexts/AdminToastContext";
import { AdminConfirmProvider } from "../_contexts/AdminConfirmContext";
import AdminTelemetryMount from "./AdminTelemetryMount";
import VersionUpgradeModal from "../_components/VersionUpgradeModal";
import { AdminShell } from "@/components/admin/admin-shell";
import { AdminRouteGuard } from "@/components/admin/admin-route-guard";
import "../admin-globals.css";
import "./admin-layout.css";
import "./admin-theme.css";
import "./admin-buttons-v2.css";
import "./admin-aesthetic.css";
import "./dashboard-v2.css";
import "./admin-modals-buttons-v2.css";
import "./admin-pages-zoho.css";
import "./admin-dashboard-new.css";
import "../admin-ux-enhancements.css";
import "@/components/admin/admin-loader.css";
import "./admin-flat-fix.css";
import "./admin-palette-mix.css";

export default function AdminDashboardLayout({ children }) {
  return (
    <AdminRoleProvider>
      <AdminThemeProvider>
        <AdminToastProvider>
          <AdminConfirmProvider>
            <Suspense fallback={null}>
              <AdminTelemetryMount />
            </Suspense>
            <VersionUpgradeModal />
            <AdminShell>
              <AdminRouteGuard>{children}</AdminRouteGuard>
            </AdminShell>
          </AdminConfirmProvider>
        </AdminToastProvider>
      </AdminThemeProvider>
    </AdminRoleProvider>
  );
}
