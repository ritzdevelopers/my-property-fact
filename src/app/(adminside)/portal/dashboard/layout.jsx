"use client";
import React, { useState } from "react";
import ModernPortalSidenav from "../_components/ModernPortalSidenav";
import ErrorBoundary from "../_components/ErrorBoundary";
import PortalAuthLoader from "../_components/PortalAuthLoader";
import PortalUserAvatar from "../_components/PortalUserAvatar";
import { useUser } from "../_contexts/UserContext";
import { getUserDisplayName } from "../_utils/userDisplay";
import { Menu } from "lucide-react";

export default function PortalDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { userData, loading: userLoading } = useUser();
  const displayName = getUserDisplayName(userData);

  const toggleSidebar = () => {
    setSidebarOpen((open) => !open);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
      if (window.innerWidth > 992) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  React.useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobile, sidebarOpen]);

  if (userLoading) {
    return <PortalAuthLoader />;
  }

  return (
    <ErrorBoundary>
      <div className="portal-layout">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={toggleSidebar}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="mobile-header__center">
            <h4 className="mobile-title">Broker Portal</h4>
            {displayName && displayName !== "Broker" && (
              <span className="mobile-user-name">{displayName}</span>
            )}
          </div>
          <PortalUserAvatar userData={userData} size="sm" className="mobile-header__avatar" />
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && <div className="mobile-overlay" onClick={closeSidebar}></div>}

        {/* Sidebar */}
        <div className={`sidebar-wrapper ${sidebarOpen ? "mobile-open" : ""}`}>
          <ModernPortalSidenav onNavigate={isMobile ? closeSidebar : undefined} />
        </div>

        {/* Main Content */}
        <div className="main-content">{children}</div>
      </div>

      <style jsx>{`
        .portal-layout {
          display: flex;
          min-height: 100vh;
          background: #f5f7f6;
          position: relative;
        }

        .mobile-header {
          display: none;
          align-items: center;
          padding: 0.65rem 0.9rem;
          background: #fff;
          border-bottom: 1px solid #e9ecef;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
          z-index: 1051;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 58px;
          gap: 0.75rem;
        }

        .mobile-header__center {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .mobile-user-name {
          font-size: 0.72rem;
          color: #6b7280;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          line-height: 1.2;
        }

        .mobile-header :global(.mobile-header__avatar) {
          flex-shrink: 0;
        }

        .mobile-menu-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border: 1px solid #e3e8e6;
          border-radius: 10px;
          background: #fff;
          color: #0b2b1e;
          cursor: pointer;
        }

        .mobile-menu-btn:hover {
          background: #f2f5f4;
        }

        .mobile-title {
          margin: 0;
          color: #111827;
          font-weight: 700;
          font-size: 1rem;
          line-height: 1.2;
        }

        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.45);
          z-index: 1045;
          animation: fadeIn 0.25s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .sidebar-wrapper {
          width: 248px;
          flex-shrink: 0;
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          height: 100dvh;
          overflow: hidden;
          z-index: 1040;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }

        .main-content {
          flex: 1;
          min-width: 0;
          padding: 0;
          margin-left: 248px;
          min-height: 100vh;
          width: calc(100% - 248px);
        }

        @media (max-width: 992px) {
          .mobile-header {
            display: flex;
          }

          .mobile-overlay {
            display: block;
          }

          .sidebar-wrapper {
            z-index: 1050;
            transform: translateX(-100%);
            width: 268px;
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.28);
            visibility: hidden;
            opacity: 0;
            transition:
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              visibility 0.3s,
              opacity 0.3s;
          }

          .sidebar-wrapper.mobile-open {
            transform: translateX(0);
            visibility: visible;
            opacity: 1;
          }

          .main-content {
            width: 100%;
            margin-left: 0;
            margin-top: 58px;
          }

          .portal-layout {
            overflow-x: hidden;
          }
        }

        @media (max-width: 400px) {
          .sidebar-wrapper {
            width: 88vw;
          }
        }
      `}</style>
    </ErrorBoundary>
  );
}
