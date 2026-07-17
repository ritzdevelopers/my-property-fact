"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AdminSidebar } from "./sidebar";
import { AdminHeader } from "./header";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { NavLoadingProvider } from "@/components/admin/navigation-loading";
import axios from "axios";

export function AdminLayout({
  children,
  user,
  isSuperAdmin = false,
  hasPermission = () => false,
  theme = "light",
  onThemeToggle,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [logoutOpen, setLogoutOpen] = React.useState(false);
  const [logoutLoading, setLogoutLoading] = React.useState(false);
  const { toast } = useToast();

  const performLogout = async () => {
    setLogoutLoading(true);
    try {
      const baseUrl = (
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005/"
      ).replace(/\/?$/, "/");
      const response = await axios.post(
        `${baseUrl}admin-portal/auth/logout`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200) {
        toast.success("You have been signed out safely.");
        window.location.href = "/admin";
      }
    } catch (error) {
      toast.error("Sign out failed. Please try again.");
      console.error(error);
    } finally {
      setLogoutLoading(false);
      setLogoutOpen(false);
    }
  };

  const handleLogout = () => {
    setLogoutOpen(true);
  };

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <NavLoadingProvider>
    <div className={cn("admin-v2-shell min-h-screen bg-background", theme === "dark" && "dark")}>
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:z-50 md:flex">
        <AdminSidebar
          collapsed={sidebarCollapsed}
          onLinkClick={handleLinkClick}
          isSuperAdmin={isSuperAdmin}
          hasPermission={hasPermission}
          onLogout={handleLogout}
          theme={theme}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <AdminSidebar
            collapsed={false}
            onLinkClick={handleLinkClick}
            isSuperAdmin={isSuperAdmin}
            hasPermission={hasPermission}
            // onSidebarToggle={() =>{
            //   setSidebarCollapsed(!sidebarCollapsed)
            // }}
            onLogout={handleLogout}
            theme={theme}
          />
        </SheetContent>
      </Sheet>

      {/* Main content area */}
      <div
        className={cn(
          "flex flex-col transition-all duration-300",
          sidebarCollapsed ? "md:pl-16" : "md:pl-64"
        )}
      >
        <AdminHeader
          user={user}
          theme={theme}
          onThemeToggle={onThemeToggle}
          onSidebarToggle={() => {
            if (window.innerWidth < 768) {
              setMobileOpen(true);
            } else {
              setSidebarCollapsed(!sidebarCollapsed);
            }
          }}
          sidebarCollapsed={sidebarCollapsed}
          onLogout={handleLogout}
        />

        <main className="flex-1 admin-page-canvas">
          <div className="admin-page-inner container mx-auto p-4 md:p-6 lg:p-8 max-w-[1600px]">
            {children}
          </div>
        </main>
      </div>

      {/* Toast notifications */}
      <Toaster />

      <ConfirmDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title="Sign out of admin?"
        description="You will need to sign in again to access the dashboard. Any unsaved work on open pages may be lost."
        confirmText="Sign out"
        cancelText="Stay signed in"
        variant="warning"
        loading={logoutLoading}
        onConfirm={performLogout}
      />
    </div>
    </NavLoadingProvider>
  );
}

export default AdminLayout;
