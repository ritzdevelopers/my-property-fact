"use client";
import { Suspense } from "react";
import { AdminRoleProvider } from "../_contexts/AdminRoleContext";
import { AdminThemeProvider } from "../_contexts/AdminThemeContext";
import { AdminToastProvider } from "../_contexts/AdminToastContext";
import { AdminConfirmProvider } from "../_contexts/AdminConfirmContext";
import AdminTimeBand from "../_components/AdminTimeBand";
import AdminTelemetryMount from "./AdminTelemetryMount";
import NavigationLoader from "./NavigationLoader";
import VersionUpgradeModal from "../_components/VersionUpgradeModal";
import { AdminShell } from "@/components/admin/admin-shell";
import "../admin-globals.css";
import "./admin-layout.css";
import "./admin-theme.css";
import "./admin-buttons-v2.css";
import "./dashboard-home.css";
import "./admin-aesthetic.css";
import "./dashboard-v2.css";
import "./admin-modals-buttons-v2.css";
import "../admin-ux-enhancements.css";

export default function AdminDashboardLayout({ children }) {
  return (
    <AdminRoleProvider>
      <AdminThemeProvider>
        <AdminToastProvider>
          <AdminConfirmProvider>
          <AdminTimeBand />
          <Suspense fallback={null}>
            <AdminTelemetryMount />
          </Suspense>
          <VersionUpgradeModal />
          <NavigationLoader />
          <AdminShell>{children}</AdminShell>
          </AdminConfirmProvider>
        </AdminToastProvider>
      </AdminThemeProvider>
    </AdminRoleProvider>
  );
}
