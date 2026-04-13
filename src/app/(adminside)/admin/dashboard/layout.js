"use client";
import { useState, useEffect, Suspense } from "react";
import { AdminRoleProvider } from "../_contexts/AdminRoleContext";
import { AdminThemeProvider } from "../_contexts/AdminThemeContext";
import SideNav from "../_sidenav/page";
import AdminTopBar from "./AdminTopBar";
import NavigationLoader from "./NavigationLoader";
import AdminTelemetryMount from "./AdminTelemetryMount";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import "./admin-theme.css";
import "./admin-layout.css";

const MOBILE_SIDEBAR_MAX = 992;

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const isMobileLayout = () => window.innerWidth <= MOBILE_SIDEBAR_MAX;
    const applyBodyScroll = () => {
      if (isMobileLayout() && sidebarOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    };
    applyBodyScroll();
    const onResize = () => {
      if (!isMobileLayout()) {
        setSidebarOpen(false);
        document.body.style.overflow = "";
      } else {
        applyBodyScroll();
      }
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  return (
    <AdminRoleProvider>
    <AdminThemeProvider>
    <Suspense fallback={null}>
      <AdminTelemetryMount />
    </Suspense>
    <div className="admin-layout-wrapper">
      {/* Mobile Header */}
      <div className="admin-mobile-header">
        <button 
          className="mobile-menu-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <FontAwesomeIcon icon={sidebarOpen ? faTimes : faBars} />
        </button>
        <h5 className="mobile-header-title">Admin Dashboard</h5>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="admin-mobile-overlay"
          onClick={closeSidebar}
        />
      )}

      <div className="admin-layout-container">
        {/* Sidebar */}
        <div className={`admin-sidebar-wrapper ${sidebarOpen ? 'sidebar-open' : ''}`}>
          <SideNav onLinkClick={closeSidebar} />
        </div>

        {/* Main Content — inner surface wraps all dashboard pages */}
        <div className="admin-main-content">
          <NavigationLoader />
          <div className="admin-main-inner">
            <AdminTopBar />
            <div className="admin-page-container admin-page-surface">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
    </AdminThemeProvider>
    </AdminRoleProvider>
  );
}
