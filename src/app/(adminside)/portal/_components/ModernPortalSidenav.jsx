"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CBadge,
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
  CSidebarNav,
  CNavGroup,
  CNavItem,
  CNavTitle,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from "@coreui/react";
import "@coreui/coreui/dist/css/coreui.min.css";
import Image from "next/image";
import { useState, useEffect } from "react";
import sidenavConfig from "./sidenav-config.json";
import { useUser } from "../_contexts/UserContext";
import { cilX } from "@coreui/icons";
import CIcon from "@coreui/icons-react";

export default function ModernPortalSidenav({ onNavigate }) {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const { userData, logout } = useUser();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 992);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const handleNavigation = (href) => {
    router.push(href);
    if (onNavigate) onNavigate();
  };

  const toggleDropdown = (id) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };


  const renderNavigation = () => {
    return sidenavConfig.navigation.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <CNavGroup
            key={item.id}
            toggler={
              <>
                {item.label}
                {item.badge && (
                  <CBadge color="primary ms-auto">{item.badge}</CBadge>
                )}
              </>
            }
          >
            {item.children.map((child) => (
              <CNavItem key={child.id}>
                <Link 
                  href={child.href} 
                  className="nav-link"
                  onClick={onNavigate ? () => onNavigate() : undefined}
                >
                  <span className="nav-icon">
                    <span className="nav-icon-bullet"></span>
                  </span>
                  {child.label}
                  {child.badge && (
                    <CBadge color="secondary ms-auto">{child.badge}</CBadge>
                  )}
                </Link>
              </CNavItem>
            ))}
          </CNavGroup>
        );
      } else {
        return (
          <CNavItem key={item.id}>
            <Link 
              href={item.href} 
              className="nav-link"
              onClick={onNavigate ? () => onNavigate() : undefined}
            >
              {item.label}
              {item.badge && (
                <CBadge color="primary ms-auto">{item.badge}</CBadge>
              )}
            </Link>
          </CNavItem>
        );
      }
    });
  };

  return (
    <div className="sidebar-container">
      <CSidebar className="border-end sidebar-modern">
        <CSidebarHeader className="border-bottom sidebar-header-modern">
          <CSidebarBrand>
            <div className="brand-container">
              <Image
                src="/logo.webp"
                alt="portal-logo"
                height={40}
                width={40}
                className="brand-logo"
              />
              <div className="brand-text">
                <h6 className="brand-title text-black text-decoration-none">Property Portal</h6>
                {/* <small className="brand-subtitle">Agent Dashboard</small> */}
              </div>
              {onNavigate && (
                <button 
                  className="mobile-close-btn"
                  onClick={onNavigate}
                  aria-label="Close sidebar"
                >
                  <CIcon icon={cilX} />
                </button>
              )}
            </div>
          </CSidebarBrand>
        </CSidebarHeader>

        <CSidebarNav className="sidebar-nav-modern">
          <CNavTitle className="nav-title-modern">Navigation</CNavTitle>
          {renderNavigation()}
        </CSidebarNav>

        <CSidebarHeader className="border-top sidebar-footer-modern">
          <CDropdown>
            <CDropdownToggle
              placement="bottom-end"
              className="py-2 user-dropdown-toggle"
              caret={false}
            >
              <div className="user-profile">
                <Image
                  src="/logo.webp"
                  alt="user-avatar"
                  height={32}
                  width={32}
                  className="user-avatar"
                />
                <div className="user-info">
                  <div className="user-name">{userData?.fullName || 'User'}</div>
                  <div className="user-role">{userData?.role || 'Agent'}</div>
                </div>
              </div>
            </CDropdownToggle>
            <CDropdownMenu className="pt-0 user-dropdown-menu" placement="bottom-end">
              <CDropdownItem onClick={() => handleNavigation("/portal/dashboard/profile")}>
                Profile
              </CDropdownItem>
              <CDropdownItem onClick={() => handleNavigation("/portal/dashboard/notifications")}>
                Notifications
              </CDropdownItem>
              <CDropdownItem divider="true" />
              <CDropdownItem onClick={handleLogout}>
                Logout
              </CDropdownItem>
            </CDropdownMenu>
          </CDropdown>
        </CSidebarHeader>
      </CSidebar>

      <style jsx>{`
        .sidebar-container {
          height: 100vh !important;
          max-height: 100vh !important;
          position: relative;
          top: 0;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-sizing: border-box;
        }

        .sidebar-modern {
          background: #68ac78 !important;
          box-shadow: none !important;
          height: 100vh !important;
          max-height: 100vh !important;
          min-height: 100vh !important;
          border: none !important;
          border-right: 1px solid rgba(255, 255, 255, 0.2) !important;
          position: relative !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }

        .sidebar-header-modern {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2) !important;
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          padding: 1rem;
          flex-shrink: 0;
          box-sizing: border-box;
        }

        .brand-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
          width: 100%;
          min-width: 0;
          flex: 1;
        }

        .mobile-close-btn {
          display: none;
          margin-left: auto;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          padding: 0.5rem;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          min-width: 36px;
          min-height: 36px;
          flex-shrink: 0;
          z-index: 10;
        }

        .mobile-close-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: rotate(90deg);
        }

        .mobile-close-btn:active {
          transform: rotate(90deg) scale(0.95);
        }

        .brand-logo {
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .brand-text {
          color: white;
        }

        .brand-title {
          margin: 0;
          font-weight: 600;
          font-size: 1.1rem;
          color: white;
          text-decoration: none;
        }

        .brand-subtitle {
          opacity: 0.8;
          font-size: 0.75rem;
        }

        .sidebar-nav-modern {
          padding: 1rem 0;
          flex: 1 1 auto;
          min-height: 0;
          overflow-y: auto;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        .nav-title-modern {
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 0 1rem 0.5rem;
          margin-bottom: 0.5rem;
        }

        .sidebar-nav-modern :global(.nav-link) {
          color: rgba(255, 255, 255, 0.9);
          padding: 0.75rem 1rem;
          margin: 0.125rem 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          width: auto;
          min-width: 0;
        }

        .sidebar-nav-modern :global(.nav-link:hover) {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: translateX(4px);
        }

        .sidebar-nav-modern :global(.nav-link:active) {
          background: rgba(255, 255, 255, 0.15);
          transform: scale(0.98);
        }

        .sidebar-nav-modern :global(.nav-link.active) {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .sidebar-nav-modern :global(.nav-group-items) {
          margin-left: 1rem;
        }

        .sidebar-nav-modern :global(.nav-group-items .nav-link) {
          font-size: 0.9rem;
          padding: 0.5rem 1rem 0.5rem 2rem;
          position: relative;
        }

        .sidebar-nav-modern :global(.nav-group-items .nav-icon) {
          position: absolute;
          left: 1rem;
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
        }


        .sidebar-footer-modern {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-bottom: none !important;
          border-left: none !important;
          border-right: none !important;
          padding: 1rem;
          flex-shrink: 0;
          margin-top: auto;
          box-sizing: border-box;
        }

        .user-dropdown-toggle {
          background: none !important;
          border: none !important;
          padding: 0.5rem;
          border-radius: 8px;
          transition: all 0.3s ease;
          width: 100%;
        }

        .user-dropdown-toggle:hover {
          background: rgba(255, 255, 255, 0.1) !important;
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: white;
        }

        .user-avatar {
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .user-info {
          flex: 1;
          text-align: left;
        }

        .user-name {
          font-weight: 600;
          font-size: 0.9rem;
          margin: 0;
        }

        .user-role {
          font-size: 0.75rem;
          opacity: 0.8;
          margin: 0;
        }

        .user-dropdown-menu {
          min-width: 200px;
          border: none;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          border-radius: 8px;
        }

        .user-dropdown-menu :global(.dropdown-item) {
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          transition: all 0.2s ease;
        }

        .user-dropdown-menu :global(.dropdown-item:hover) {
          background: #f8f9fa;
          color: #495057;
        }

        .user-dropdown-menu :global(.dropdown-divider) {
          margin: 0.5rem 0;
        }

        @media (max-width: 992px) {
          .sidebar-container {
            height: 100vh !important;
            max-height: 100vh !important;
            width: 100% !important;
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
          }

          .mobile-close-btn {
            display: flex !important;
            visibility: visible !important;
            opacity: 1 !important;
          }

          .brand-text {
            display: block !important;
            flex: 1;
            min-width: 0;
            overflow: hidden;
            max-width: calc(100% - 120px);
          }

          .brand-title {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }

          .user-info {
            display: block !important;
            flex: 1;
            min-width: 0;
            overflow: hidden;
            max-width: calc(100% - 80px);
          }

          .user-name,
          .user-role {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 100%;
          }

          .sidebar-modern {
            height: 100vh !important;
            min-height: 100vh !important;
            max-height: 100vh !important;
            width: 100% !important;
            position: relative !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            margin-left: 0px !important;
          }

          .sidebar-header-modern {
            padding: 1rem !important;
            flex-shrink: 0 !important;
            display: flex !important;
            width: 100% !important;
          }

          .sidebar-nav-modern {
            padding: 0.75rem 0 !important;
            flex: 1 1 auto !important;
            min-height: 0 !important;
            overflow-y: auto !important;
            overflow-x: hidden !important;
            width: 100% !important;
            display: block !important;
            -webkit-overflow-scrolling: touch;
          }

          .sidebar-nav-modern :global(.nav-link) {
            padding: 0.875rem 1rem !important;
            margin: 0.125rem 0.5rem !important;
            font-size: 0.95rem !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            width: auto !important;
            max-width: calc(100% - 1rem) !important;
          }

          .sidebar-footer-modern {
            padding: 1rem !important;
            flex-shrink: 0 !important;
            margin-top: auto !important;
            display: flex !important;
            width: 100% !important;
          }

          .nav-title-modern {
            padding: 0 1rem 0.5rem !important;
            font-size: 0.7rem !important;
            display: block !important;
          }

          .user-dropdown-toggle {
            padding: 0.625rem !important;
            width: 100% !important;
          }

          .user-avatar {
            width: 36px !important;
            height: 36px !important;
            flex-shrink: 0 !important;
          }

          .brand-container {
            width: 100% !important;
            display: flex !important;
            align-items: center !important;
          }

          .brand-logo {
            flex-shrink: 0 !important;
          }

          .sidebar-nav-modern :global(.nav-group),
          .sidebar-nav-modern :global(.nav-group-items) {
            display: block !important;
            width: 100% !important;
          }

          .sidebar-nav-modern :global(.nav-group-items .nav-link) {
            max-width: calc(100% - 1rem) !important;
          }

          .sidebar-nav-modern :global(.nav-group .nav-group-toggle) {
            padding: 0.875rem 1rem !important;
            margin: 0.125rem 0.5rem !important;
            font-size: 0.95rem !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            width: auto !important;
            max-width: calc(100% - 1rem) !important;
          }
        }

        @media (max-width: 768px) {
          .sidebar-container {
            width: 100% !important;
          }

          .sidebar-header-modern {
            padding: 0.875rem;
          }

          .sidebar-nav-modern :global(.nav-link) {
            padding: 0.875rem 0.875rem;
            font-size: 0.9rem;
            margin: 0.125rem 0.5rem;
          }

          .sidebar-nav-modern :global(.nav-group-items .nav-link) {
            padding: 0.625rem 0.875rem 0.625rem 1.75rem;
            font-size: 0.85rem;
          }

          .brand-logo {
            width: 36px;
            height: 36px;
          }

          .brand-text {
            display: block !important;
          }
        }

        @media (max-width: 576px) {
          .sidebar-container {
            width: 100% !important;
            height: 100vh !important;
          }

          .sidebar-modern {
            width: 100% !important;
            height: 100vh !important;
          }

          .sidebar-header-modern {
            padding: 0.875rem;
          }

          .sidebar-nav-modern {
            padding: 0.75rem 0;
            flex: 1 1 auto;
            min-height: 0;
            overflow-y: auto;
            overflow-x: hidden;
          }

          .sidebar-nav-modern :global(.nav-link) {
            padding: 0.875rem 1rem;
            font-size: 0.95rem;
            margin: 0.125rem 0.5rem;
            min-height: 44px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .sidebar-nav-modern :global(.nav-group-items .nav-link) {
            padding: 0.75rem 1rem 0.75rem 2rem;
            font-size: 0.9rem;
            min-height: 40px;
          }

          .sidebar-footer-modern {
            padding: 0.875rem;
          }

          .user-dropdown-toggle {
            padding: 0.75rem;
            min-height: 44px;
          }

          .user-avatar {
            width: 40px;
            height: 40px;
          }

          .brand-logo {
            width: 36px;
            height: 36px;
          }

          .brand-text {
            display: block !important;
          }

          .nav-title-modern {
            padding: 0 1rem 0.5rem;
            font-size: 0.7rem;
          }

          .mobile-close-btn {
            width: 40px;
            height: 40px;
          }
        }

        @media (max-width: 400px) {
          .sidebar-nav-modern :global(.nav-link) {
            padding: 0.875rem;
            font-size: 0.875rem;
          }

          .brand-container {
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}
