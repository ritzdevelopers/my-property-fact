"use client";
import {
  CBadge,
  CSidebar,
  CSidebarBrand,
  CSidebarHeader,
  CSidebarNav,
  CSidebarToggler,
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

export default function PortalSideNav() {
  //Function to handle user logout
  const handleLogout = () => {
    // Clear your auth token / cookies here
  };

  return (
    <>
      <div className="container-fluid">
        <CSidebar className="border-end">
          <CSidebarHeader className="border-bottom">
            <CSidebarBrand>
              <Image
                src="/logo.webp"
                alt="portal-logo"
                height={100}
                width={100}
                className="img-fluid rounded rounded-3"
              />
            </CSidebarBrand>
          </CSidebarHeader>
          <CSidebarNav>
            <CNavTitle>Dashboard</CNavTitle>
            <CNavItem href="/portal/dashboard">
              Dashboard
            </CNavItem>
            <CNavItem href="/portal/dashboard/listings">
              Listings
              <CBadge color="primary ms-auto">NEW</CBadge>
            </CNavItem>
            <CNavGroup
              toggler={
                <>
                  Leads
                </>
              }
            >
              <CNavItem href="#">
                <span className="nav-icon">
                  <span className="nav-icon-bullet"></span>
                </span>{" "}
                Nav dropdown item
              </CNavItem>
              <CNavItem href="#">
                <span className="nav-icon">
                  <span className="nav-icon-bullet"></span>
                </span>{" "}
                Nav dropdown item
              </CNavItem>
            </CNavGroup>
            <CNavItem href="https://coreui.io">
              Download CoreUI
            </CNavItem>
            <CNavItem href="https://coreui.io/pro/">
              Try CoreUI PRO
            </CNavItem>
          </CSidebarNav>
          <CSidebarHeader className="border-top">
            {/* User Dropdown */}
            <CDropdown>
              <CDropdownToggle
                placement="bottom-end"
                className="py-0"
                caret={false}
              >
                <Image
                  src="/logo.webp"
                  alt="user-icon"
                  height={50}
                  width={50}
                  className="img-fluid rounded-pill bg-danger"
                />
              </CDropdownToggle>
              <CDropdownMenu className="pt-0" placement="bottom-end">
                <CDropdownItem href="#">
                  Profile
                </CDropdownItem>
                <CDropdownItem href="#">
                  Settings
                </CDropdownItem>
                <CDropdownItem href="#" onClick={handleLogout}>
                  Logout
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CSidebarHeader>
        </CSidebar>
      </div>
    </>
  );
}
