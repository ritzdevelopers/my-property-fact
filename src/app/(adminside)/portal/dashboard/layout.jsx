"use client";
import React, { useState } from "react";
import ModernPortalSidenav from "../_components/ModernPortalSidenav";
import ErrorBoundary from "../_components/ErrorBoundary";
import CSSLoader from "../_components/CSSLoader";
import PortalUserAvatar from "../_components/PortalUserAvatar";
import { useUser } from "../_contexts/UserContext";
import { getUserDisplayName } from "../_utils/userDisplay";
import { Button } from "react-bootstrap";
import { cilMenu } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export default function PortalDashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { userData } = useUser();
  const displayName = getUserDisplayName(userData);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Handle window resize and mobile detection
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
      if (window.innerWidth > 992) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Prevent body scroll when sidebar is open on mobile
  React.useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);

  // Simulate loading completion
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <CSSLoader />;
  }

  return (
    <ErrorBoundary>
      <div className="portal-layout">
        {/* Mobile Header */}
        <div className="mobile-header">
          <Button
            variant="outline-primary"
            className="mobile-menu-btn"
            onClick={toggleSidebar}
          >
            <CIcon icon={cilMenu} />
          </Button>
          <div className="mobile-header__center">
            <h4 className="mobile-title">Broker Portal</h4>
            {displayName && displayName !== "Broker" && (
              <span className="mobile-user-name">{displayName}</span>
            )}
          </div>
          <PortalUserAvatar userData={userData} size="sm" className="mobile-header__avatar" />
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div className="mobile-overlay" onClick={closeSidebar}></div>
        )}

        {/* Sidebar */}
        <div className={`sidebar-wrapper ${sidebarOpen ? 'mobile-open' : ''}`}>
          <ModernPortalSidenav onNavigate={isMobile ? closeSidebar : undefined} />
        </div>

        {/* Main Content */}
        <div className="main-content">
          {children}
        </div>
      </div>
      
      <style jsx>{`
        .portal-layout {
          display: flex;
          min-height: 100vh;
          background: #f8f9fa;
          position: relative;
        }

        .mobile-header {
          display: none;
          align-items: center;
          padding: 0.75rem 1rem;
          background: white;
          border-bottom: 1px solid #e9ecef;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          z-index: 1051;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
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
          margin-right: 1rem;
          border-radius: 8px;
          padding: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mobile-title {
          margin: 0;
          color: #212529;
          font-weight: 600;
          font-size: 1.25rem;
        }

        .mobile-overlay {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1045;
          transition: opacity 0.3s ease;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .sidebar-wrapper {
          width: 280px;
          flex-shrink: 0;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: fixed;
          top: 0;
          left: 0;
          height: 100vh;
          overflow: hidden;
          z-index: 1040;
          background: transparent;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
          will-change: transform;
        }

        .sidebar-wrapper :global(.sidebar-container) {
          height: 100vh !important;
          max-height: 100vh !important;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
          width: 100%;
        }

        .sidebar-wrapper :global(.sidebar-modern) {
          height: 100vh !important;          
          width: 100% !important;
          max-height: 100vh !important;
          min-height: 100vh !important;
          border: none !important;
          border-right: 1px solid rgba(255, 255, 255, 0.2) !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          position: relative !important;
        }

        .sidebar-wrapper :global(.sidebar-modern .border-end) {
          border-right: none !important;
        }

        .sidebar-wrapper :global(.sidebar-header-modern) {
          flex-shrink: 0;
          min-height: fit-content;
        }

        .sidebar-wrapper :global(.sidebar-nav-modern) {
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
        }

        .sidebar-wrapper :global(.sidebar-footer-modern) {
          flex-shrink: 0;
          margin-top: auto;
          min-height: fit-content;
        }

        .main-content {
          flex: 1;
          overflow-x: auto;
          padding: 0;
          margin-left: 280px;
          min-height: 100vh;
          width: calc(100% - 280px);
        }

        @media (max-width: 992px) {
          .mobile-header {
            display: flex !important;
          }

          .mobile-overlay {
            display: block !important;
          }

          .sidebar-wrapper {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 1050 !important;
            transform: translateX(-100%) !important;
            height: 100vh !important;
            overflow: hidden !important;
            width: 280px !important;
            box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3) !important;
            visibility: hidden;
            opacity: 0;
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.3s, opacity 0.3s;
          }

          .sidebar-wrapper.mobile-open {
            transform: translateX(0) !important;
            visibility: visible !important;
            opacity: 1 !important;
          }

          .sidebar-wrapper :global(.sidebar-container) {
            width: 100% !important;
            height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
          }

          .sidebar-wrapper :global(.sidebar-modern) {
            width: 100% !important;
            height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            margin-left: 0px !important;
          }

          .sidebar-wrapper :global(.sidebar-header-modern) {
            display: flex !important;
            flex-shrink: 0 !important;
          }

          .sidebar-wrapper :global(.sidebar-nav-modern) {
            display: block !important;
            flex: 1 1 auto !important;
            min-height: 0 !important;
          }

          .sidebar-wrapper :global(.sidebar-footer-modern) {
            display: flex !important;
            flex-shrink: 0 !important;
          }

          .main-content {
            width: 100% !important;
            margin-left: 0 !important;
            margin-top: 60px !important;
          }

          .portal-layout {
            overflow-x: hidden;
          }
        }

        @media (max-width: 768px) {
          .sidebar-wrapper {
            width: 85vw !important;
            max-width: 320px !important;
          }
        }

        @media (max-width: 576px) {
          .mobile-header {
            padding: 0.75rem;
            height: 56px;
          }

          .mobile-title {
            font-size: 1rem;
          }

          .mobile-menu-btn {
            padding: 0.375rem;
            margin-right: 0.75rem;
          }

          .sidebar-wrapper {
            width: 90vw !important;
            max-width: 320px !important;
          }

          .main-content {
            padding: 0;
            margin-top: 56px !important;
          }
        }

        @media (max-width: 400px) {
          .sidebar-wrapper {
            width: 100vw !important;
            max-width: 100vw !important;
          }
        }
      `}</style>
    </ErrorBoundary>
  );
}
