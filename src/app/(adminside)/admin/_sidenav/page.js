"use client";
import Link from "next/link";
import "./sidenav.css";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useAdminRole } from "../_contexts/AdminRoleContext";
import { useAdminTheme } from "../_contexts/AdminThemeContext";
import { ADMIN_PERMISSIONS } from "../adminPermissions";
import { toast } from "react-toastify";
import Image from "next/image";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGaugeHigh,
  faClipboardCheck,
  faUsers,
  faUserClock,
  faGlobe,
  faSliders,
  faBuilding,
  faFolderOpen,
  faChartLine,
  faLayerGroup,
  faStar,
  faMapLocationDot,
  faEnvelopeOpenText,
  faPenToSquare,
  faBookOpen,
  faRightFromBracket,
  faHouse,
  faImages,
  faGear,
  faCircleQuestion,
  faClipboardList,
  faDatabase,
} from "@fortawesome/free-solid-svg-icons";

export default function SideNav({ onLinkClick }) {
  const { isSuperAdmin, hasPermission } = useAdminRole();
  const { theme } = useAdminTheme();
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState(null);
  // Check if a path matches the current pathname
  const isActive = (path) => {
    if (path === "/admin/dashboard") {
      return pathname === "/admin/dashboard";
    }
    // Use exact match or ensure the next character is '/' or end of string
    // This prevents /web-story from matching /web-story-category
    return (
      pathname === path ||
      (pathname.startsWith(path) &&
        (pathname.length === path.length || pathname[path.length] === "/"))
    );
  };

  // Check if any child link in a dropdown is active
  const isDropdownActive = (paths) => {
    return paths.some((path) => isActive(path));
  };

  const prevPathnameRef = useRef(null);

  // Auto-open dropdowns only when pathname changes (on navigation), not when user toggles
  useEffect(() => {
    if (prevPathnameRef.current === pathname) return;
    prevPathnameRef.current = pathname;

    const dropdownPaths = {
      dropdown1: [
        "/admin/dashboard/project-amenity",
        "/admin/dashboard/manage-banners",
        "/admin/dashboard/manage-floor-plans",
        "/admin/dashboard/manage-gallery",
        "/admin/dashboard/manage-faqs",
        "/admin/dashboard/manage-project-about",
        "/admin/dashboard/manage-project-walkthrough",
        "/admin/dashboard/location-benifits",
      ],
      dropdown2: [
        "/admin/dashboard/city-price-data",
        "/admin/dashboard/manage-insight-headers",
        "/admin/dashboard/insight-category",
        "/admin/dashboard/top-developers",
      ],
      dropdown3: [
        "/admin/dashboard/manage-countries",
        "/admin/dashboard/manage-states",
        "/admin/dashboard/manage-cities",
        "/admin/dashboard/manage-localities",
        "/admin/dashboard/manage-score-evalution",
        "/admin/dashboard/project-types",
        "/admin/dashboard/manage-project-status",
        "/admin/dashboard/builder",
        "/admin/dashboard/budget-options",
        "/admin/dashboard/manage-career-applications",
      ],
      dropdown4: [
        "/admin/dashboard/manage-blogs",
        "/admin/dashboard/manage-categories",
      ],
      dropdown5: [
        "/admin/dashboard/web-story-category",
        "/admin/dashboard/web-story",
      ],
      dropdown6: [
        "/admin/dashboard/manage-home-banners",
        "/admin/dashboard/manage-testimonials",
      ],
    };

    Object.keys(dropdownPaths).forEach((dropdownId) => {
      if (isDropdownActive(dropdownPaths[dropdownId])) {
        setActiveDropdown(dropdownId);
      }
    });

    if (
      isActive("/admin/dashboard/manage-home-banners") ||
      isActive("/admin/dashboard/manage-testimonials")
    ) {
      setActiveSubDropdown("dropdown6-home-page");
    }
  }, [pathname]);

  const toggleDropdown = (e, id) => {
    e?.preventDefault();
    setActiveDropdown((current) => (current === id ? null : id));
  };

  const toggleSubDropdown = (e, id) => {
    e?.preventDefault();
    setActiveSubDropdown((current) => (current === id ? null : id));
  };

  const handleLinkClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };
  // function for handling logout
  const handleLogout = async () => {
    const confirmed = window.confirm("Are you sure you want to log out?");
    if (!confirmed) return;
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8005/").replace(/\/?$/, "/");
      const response = await axios.post(
        `${baseUrl}admin-portal/auth/logout`,
        {},
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        },
      );

      if (response.status === 200) {
        toast.success("Logout successful...");
        window.location.href = "/admin";
      }
    } catch (error) {
      toast.error("Logout failed");
      console.error(error);
    }
  };
  return (
    // Sidebar
    <nav id="sidebar">
      <div className="sidebar-header">
        <div
          className={`sidebar-brand-inner admin-sidebar-logo-wrap${
            theme === "dark" ? " admin-sidebar-logo-wrap--dark-asset" : ""
          }`}
        >
          <Image
            src={
              theme === "dark"
                ? "/images/admin/login-register.svg"
                : "/images/admin/logo.svg"
            }
            alt="My Property Fact"
            width={101}
            height={84}
            style={{ objectFit: "contain" }}
          />
          {/* <p className="sidebar-brand-title">My Property Fact</p> */}
        </div>
      </div>
      <ul className="list-unstyled components">
        <li className={isActive("/admin/dashboard") ? "active" : ""}>
          <Link href="/admin/dashboard" onClick={handleLinkClick}>
            <FontAwesomeIcon icon={faGaugeHigh} className="admin-nav-ico" />
            <span>Dashboard</span>
          </Link>
        </li>
        {(isSuperAdmin ||
          hasPermission(ADMIN_PERMISSIONS.MANAGE_PROPERTY_APPROVALS)) && (
            <li
              className={
                isActive("/admin/dashboard/property-approvals") ? "active" : ""
              }
            >
              <Link
                href="/admin/dashboard/property-approvals"
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon
                  icon={faClipboardCheck}
                  className="admin-nav-ico"
                />
                <span>Property Approvals</span>
              </Link>
            </li>
          )}
        {isSuperAdmin && (
          <li
            className={isActive("/admin/dashboard/manage-users") ? "active" : ""}
          >
            <Link href="/admin/dashboard/manage-users" onClick={handleLinkClick}>
              <FontAwesomeIcon icon={faUsers} className="admin-nav-ico" />
              <span>Manage Users</span>
            </Link>
          </li>
        )}
        {isSuperAdmin && (
          <li
            className={
              isActive("/admin/dashboard/pending-permissions") ? "active" : ""
            }
          >
            <Link
              href="/admin/dashboard/pending-permissions"
              onClick={handleLinkClick}
            >
              <FontAwesomeIcon icon={faUserClock} className="admin-nav-ico" />
              <span>Pending permissions</span>
            </Link>
          </li>
        )}
        {isSuperAdmin && (
          <li
            className={
              isActive("/admin/dashboard/super-tracking") ? "active" : ""
            }
          >
            <Link href="/admin/dashboard/super-tracking" onClick={handleLinkClick}>
              <FontAwesomeIcon icon={faChartLine} className="admin-nav-ico" />
              <span>MPF Traffic and Logs</span>
            </Link>
          </li>
        )}
        {isSuperAdmin && (
          <li
            className={
              isActive("/admin/dashboard/activity-log") ? "active" : ""
            }
          >
            <Link href="/admin/dashboard/activity-log" onClick={handleLinkClick}>
              <FontAwesomeIcon icon={faClipboardList} className="admin-nav-ico" />
              <span>Activity log</span>
            </Link>
          </li>
        )}
        {isSuperAdmin && (
          <li
            className={
              isActive("/admin/dashboard/data-backup") ? "active" : ""
            }
          >
            <Link href="/admin/dashboard/data-backup" onClick={handleLinkClick}>
              <FontAwesomeIcon icon={faDatabase} className="admin-nav-ico" />
              <span>Data backup</span>
            </Link>
          </li>
        )}
        {hasPermission(ADMIN_PERMISSIONS.MANAGE_WEBSITE) && (
          <li
            className={
              activeDropdown === "dropdown6" ||
                isDropdownActive([
                  "/admin/dashboard/manage-home-banners",
                  "/admin/dashboard/manage-testimonials",
                ])
                ? "active"
                : ""
            }
          >
            <button
              type="button"
              onClick={(e) => toggleDropdown(e, "dropdown6")}
              aria-expanded={activeDropdown === "dropdown6"}
              className="dropdown-toggle"
            >
              <FontAwesomeIcon icon={faGlobe} className="admin-nav-ico" />
              <span className="admin-nav-label">Manage Website</span>
            </button>
            <ul
              className={`collapse list-unstyled ms-4 ${activeDropdown === "dropdown6"
                ? "show"
                : ""
                }`}
            >
              <li
                className={
                  activeSubDropdown === "dropdown6-home-page" ||
                    isDropdownActive([
                      "/admin/dashboard/manage-home-banners",
                      "/admin/dashboard/manage-testimonials",
                    ])
                    ? "active"
                    : ""
                }
              >
                <button
                  type="button"
                  onClick={(e) => toggleSubDropdown(e, "dropdown6-home-page")}
                  aria-expanded={activeSubDropdown === "dropdown6-home-page"}
                  className="dropdown-toggle"
                >
                  <FontAwesomeIcon icon={faHouse} className="admin-nav-ico" />
                  <span className="admin-nav-label">Home Page</span>
                </button>
                <ul
                  className={`collapse list-unstyled ms-4 ${activeSubDropdown === "dropdown6-home-page"
                    ? "show"
                    : ""
                    }`}
                >
                  <li
                    className={
                      isActive("/admin/dashboard/manage-home-banners")
                        ? "active"
                        : ""
                    }
                  >
                    <Link
                      href="/admin/dashboard/manage-home-banners"
                      onClick={handleLinkClick}
                    >
                      <FontAwesomeIcon icon={faImages} className="admin-nav-ico" />
                      <span>Banners</span>
                    </Link>
                  </li>
                  <li
                    className={
                      isActive("/admin/dashboard/manage-testimonials")
                        ? "active"
                        : ""
                    }
                  >
                    <Link
                      href="/admin/dashboard/manage-testimonials"
                      onClick={handleLinkClick}
                    >
                      <FontAwesomeIcon icon={faStar} className="admin-nav-ico" />
                      <span>Testimonials</span>
                    </Link>
                  </li>
                </ul>
              </li>
            </ul>
          </li>
        )}
        {hasPermission(ADMIN_PERMISSIONS.MANAGE_OPTIONS) && (
          <li
            className={
              activeDropdown === "dropdown3" ||
                isDropdownActive([
                  "/admin/dashboard/manage-countries",
                  "/admin/dashboard/manage-states",
                  "/admin/dashboard/manage-cities",
                  "/admin/dashboard/manage-localities",
                  "/admin/dashboard/manage-score-evalution",
                  "/admin/dashboard/project-types",
                  "/admin/dashboard/manage-project-status",
                  "/admin/dashboard/builder",
                  "/admin/dashboard/budget-options",
                  "/admin/dashboard/manage-career-applications",
                ])
                ? "active"
                : ""
            }
          >
            <button
              type="button"
              onClick={(e) => toggleDropdown(e, "dropdown3")}
              aria-expanded={activeDropdown === "dropdown3"}
              className="dropdown-toggle"
            >
              <FontAwesomeIcon icon={faSliders} className="admin-nav-ico" />
              <span className="admin-nav-label">Manage Options</span>
            </button>
            <ul
              className={`collapse list-unstyled ms-4 ${activeDropdown === "dropdown3" ? "show" : ""
                }`}
            >
              <li
                className={
                  isActive("/admin/dashboard/manage-countries") ? "active" : ""
                }
              >
                <Link
                  href="/admin/dashboard/manage-countries"
                  onClick={handleLinkClick}
                >
                  Manage Countries
                </Link>
              </li>
              <li
                className={
                  isActive("/admin/dashboard/manage-states") ? "active" : ""
                }
              >
                <Link
                  href="/admin/dashboard/manage-states"
                  onClick={handleLinkClick}
                >
                  Manage States
                </Link>
              </li>
              <li
                className={
                  isActive("/admin/dashboard/manage-cities") ? "active" : ""
                }
              >
                <Link
                  href="/admin/dashboard/manage-cities"
                  onClick={handleLinkClick}
                >
                  Manage Cities
                </Link>
              </li>
              <li
                className={
                  isActive("/admin/dashboard/manage-localities") ? "active" : ""
                }
              >
                <Link
                  href="/admin/dashboard/manage-localities"
                  onClick={handleLinkClick}
                >
                  Manage Localities
                </Link>
              </li>
              <li
                className={
                  isActive("/admin/dashboard/manage-score-evalution")
                    ? "active"
                    : ""
                }
              >
                <Link
                  href="/admin/dashboard/manage-score-evalution"
                  onClick={handleLinkClick}
                >
                  Manage Score Evalution
                </Link>
              </li>
              <li
                className={
                  isActive("/admin/dashboard/project-types") ? "active" : ""
                }
              >
                <Link
                  href="/admin/dashboard/project-types"
                  onClick={handleLinkClick}
                >
                  Manage Project Types
                </Link>
              </li>
              <li
                className={
                  isActive("/admin/dashboard/manage-project-status")
                    ? "active"
                    : ""
                }
              >
                <Link
                  href="/admin/dashboard/manage-project-status"
                  onClick={handleLinkClick}
                >
                  Manage Project Status
                </Link>
              </li>
              <li
                className={isActive("/admin/dashboard/builder") ? "active" : ""}
              >
                <Link href="/admin/dashboard/builder" onClick={handleLinkClick}>
                  Manage Builders
                </Link>
              </li>
              <li
                className={
                  isActive("/admin/dashboard/budget-options") ? "active" : ""
                }
              >
                <Link
                  href="/admin/dashboard/budget-options"
                  onClick={handleLinkClick}
                >
                  Manage budget options
                </Link>
              </li>
              <li
                className={
                  isActive("/admin/dashboard/manage-career-applications")
                    ? "active"
                    : ""
                }
              >
                <Link
                  href="/admin/dashboard/manage-career-applications"
                  onClick={handleLinkClick}
                >
                  Manage career applications
                </Link>
              </li>
            </ul>
          </li>
        )}
        {hasPermission(ADMIN_PERMISSIONS.MANAGE_PROJECTS) && (
          <>
            <li
              className={
                activeDropdown === "dropdown1" ||
                  isDropdownActive([
                    "/admin/dashboard/project-amenity",
                    "/admin/dashboard/manage-banners",
                    "/admin/dashboard/manage-floor-plans",
                    "/admin/dashboard/manage-gallery",
                    "/admin/dashboard/manage-faqs",
                    "/admin/dashboard/manage-project-about",
                    "/admin/dashboard/manage-project-walkthrough",
                    "/admin/dashboard/location-benifits",
                  ])
                  ? "active"
                  : ""
              }
            >
              <button
                type="button"
                aria-expanded={activeDropdown === "dropdown1"}
                onClick={(e) => toggleDropdown(e, "dropdown1")}
                className="dropdown-toggle"
              >
                <FontAwesomeIcon icon={faBuilding} className="admin-nav-ico" />
                <span className="admin-nav-label">Management</span>
              </button>
              <ul
                className={`collapse list-unstyled ms-4 ${activeDropdown === "dropdown1" ||
                  isDropdownActive([
                    "/admin/dashboard/project-amenity",
                    "/admin/dashboard/manage-banners",
                    "/admin/dashboard/manage-floor-plans",
                    "/admin/dashboard/manage-gallery",
                    "/admin/dashboard/manage-faqs",
                    "/admin/dashboard/manage-project-about",
                    "/admin/dashboard/manage-project-walkthrough",
                    "/admin/dashboard/location-benifits",
                  ])
                  ? "show"
                  : ""
                  }`}
              >
                <li
                  className={
                    isActive("/admin/dashboard/project-amenity") ? "active" : ""
                  }
                >
                  <Link
                    href="/admin/dashboard/project-amenity"
                    onClick={handleLinkClick}
                  >
                    Manage Project&apos;s Amenities
                  </Link>
                </li>
                <li
                  className={
                    isActive("/admin/dashboard/manage-banners") ? "active" : ""
                  }
                >
                  <Link
                    href="/admin/dashboard/manage-banners"
                    onClick={handleLinkClick}
                  >
                    Manage Banners
                  </Link>
                </li>
                <li
                  className={
                    isActive("/admin/dashboard/manage-floor-plans") ? "active" : ""
                  }
                >
                  <Link
                    href="/admin/dashboard/manage-floor-plans"
                    onClick={handleLinkClick}
                  >
                    Manage Floor Plans
                  </Link>
                </li>
                <li
                  className={
                    isActive("/admin/dashboard/manage-gallery") ? "active" : ""
                  }
                >
                  <Link
                    href="/admin/dashboard/manage-gallery"
                    onClick={handleLinkClick}
                  >
                    Manage Gallery
                  </Link>
                </li>
                <li
                  className={
                    isActive("/admin/dashboard/manage-faqs") ? "active" : ""
                  }
                >
                  <Link
                    href="/admin/dashboard/manage-faqs"
                    onClick={handleLinkClick}
                  >
                    Manage FAQs
                  </Link>
                </li>
                <li
                  className={
                    isActive("/admin/dashboard/manage-project-about")
                      ? "active"
                      : ""
                  }
                >
                  <Link
                    href="/admin/dashboard/manage-project-about"
                    onClick={handleLinkClick}
                  >
                    Manage Project&apos;s About
                  </Link>
                </li>
                <li
                  className={
                    isActive("/admin/dashboard/manage-project-walkthrough")
                      ? "active"
                      : ""
                  }
                >
                  <Link
                    href="/admin/dashboard/manage-project-walkthrough"
                    onClick={handleLinkClick}
                  >
                    Manage Project&apos;s Walkthrough
                  </Link>
                </li>
                <li
                  className={
                    isActive("/admin/dashboard/location-benifits") ? "active" : ""
                  }
                >
                  <Link
                    href="/admin/dashboard/location-benifits"
                    onClick={handleLinkClick}
                  >
                    Location benifits
                  </Link>
                </li>
              </ul>
            </li>
            <li
              className={
                isActive("/admin/dashboard/manage-projects") ? "active" : ""
              }
            >
              <Link
                href="/admin/dashboard/manage-projects"
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faFolderOpen} className="admin-nav-ico" />
                <span>Manage Projects</span>
              </Link>
            </li>
          </>
        )}
        {hasPermission(ADMIN_PERMISSIONS.MANAGE_INSIGHTS) && (
          <li
            className={
              activeDropdown === "dropdown2" ||
                isDropdownActive([
                  "/admin/dashboard/city-price-data",
                  "/admin/dashboard/manage-insight-headers",
                  "/admin/dashboard/insight-category",
                  "/admin/dashboard/top-developers",
                ])
                ? "active"
                : ""
            }
          >
            <button
              type="button"
              onClick={(e) => toggleDropdown(e, "dropdown2")}
              aria-expanded={activeDropdown === "dropdown2"}
              className="dropdown-toggle"
            >
              <FontAwesomeIcon icon={faChartLine} className="admin-nav-ico" />
              <span className="admin-nav-label">Insight Management</span>
            </button>
            <ul
              className={`collapse list-unstyled ms-4 ${activeDropdown === "dropdown2" ||
                isDropdownActive([
                  "/admin/dashboard/city-price-data",
                  "/admin/dashboard/manage-insight-headers",
                  "/admin/dashboard/insight-category",
                  "/admin/dashboard/top-developers",
                ])
                ? "show"
                : ""
                }`}
            >
              <li
                className={
                  isActive("/admin/dashboard/city-price-data") ? "active" : ""
                }
              >
                <Link
                  href="/admin/dashboard/city-price-data"
                  onClick={handleLinkClick}
                >
                  City Price Data
                </Link>
              </li>
              <li
                className={
                  isActive("/admin/dashboard/manage-insight-headers")
                    ? "active"
                    : ""
                }
              >
                <Link
                  href="/admin/dashboard/manage-insight-headers"
                  onClick={handleLinkClick}
                >
                  Manage Headers
                </Link>
              </li>
              <li
                className={
                  isActive("/admin/dashboard/insight-category") ? "active" : ""
                }
              >
                <Link
                  href="/admin/dashboard/insight-category"
                  onClick={handleLinkClick}
                >
                  Manage Insight Category
                </Link>
              </li>
              <li
                className={
                  isActive("/admin/dashboard/top-developers") ? "active" : ""
                }
              >
                <Link
                  href="/admin/dashboard/top-developers"
                  onClick={handleLinkClick}
                >
                  Manage Top developers
                </Link>
              </li>
            </ul>
          </li>
        )}
        {hasPermission(ADMIN_PERMISSIONS.MANAGE_AMENITIES) && (
          <li className={isActive("/admin/dashboard/aminities") ? "active" : ""}>
            <Link href="/admin/dashboard/aminities" onClick={handleLinkClick}>
              <FontAwesomeIcon icon={faLayerGroup} className="admin-nav-ico" />
              <span>Amenities</span>
            </Link>
          </li>
        )}
        {hasPermission(ADMIN_PERMISSIONS.MANAGE_FEATURES) && (
          <li
            className={
              isActive("/admin/dashboard/manage-features") ? "active" : ""
            }
          >
            <Link
              href="/admin/dashboard/manage-features"
              onClick={handleLinkClick}
            >
              <FontAwesomeIcon icon={faStar} className="admin-nav-ico" />
              <span>Manage Features</span>
            </Link>
          </li>
        )}
        {hasPermission(ADMIN_PERMISSIONS.MANAGE_NEARBY_BENEFITS) && (
          <li
            className={
              isActive("/admin/dashboard/manage-location-benefits")
                ? "active"
                : ""
            }
          >
            <Link
              href="/admin/dashboard/manage-location-benefits"
              onClick={handleLinkClick}
            >
              <FontAwesomeIcon icon={faMapLocationDot} className="admin-nav-ico" />
              <span>Manage Nearby Benefits</span>
            </Link>
          </li>
        )}
        {(isSuperAdmin || hasPermission(ADMIN_PERMISSIONS.MANAGE_ENQUIRIES)) && (
          <li className={isActive("/admin/dashboard/enquiries") ? "active" : ""}>
            <Link href="/admin/dashboard/enquiries" onClick={handleLinkClick}>
              <FontAwesomeIcon icon={faEnvelopeOpenText} className="admin-nav-ico" />
              <span>Manage Enquiries</span>
            </Link>
          </li>
        )}
        {hasPermission(ADMIN_PERMISSIONS.MANAGE_BLOGS) && (
          <li
            className={
              activeDropdown === "dropdown4" ||
                isDropdownActive([
                  "/admin/dashboard/manage-blogs",
                  "/admin/dashboard/manage-categories",
                ])
                ? "active"
                : ""
            }
          >
            <button
              type="button"
              onClick={(e) => toggleDropdown(e, "dropdown4")}
              aria-expanded={activeDropdown === "dropdown4"}
              className="dropdown-toggle"
            >
              <FontAwesomeIcon icon={faPenToSquare} className="admin-nav-ico" />
              <span className="admin-nav-label">Blog management</span>
            </button>
            <ul
              className={`collapse list-unstyled ms-4 ${activeDropdown === "dropdown4" ||
                isDropdownActive([
                  "/admin/dashboard/manage-blogs",
                  "/admin/dashboard/manage-categories",
                ])
                ? "show"
                : ""
                }`}
            >
              <li
                className={
                  isActive("/admin/dashboard/manage-blogs") ? "active" : ""
                }
              >
                <Link
                  href="/admin/dashboard/manage-blogs"
                  onClick={handleLinkClick}
                >
                  Manage Blogs
                </Link>
              </li>
              <li
                className={
                  isActive("/admin/dashboard/manage-categories") ? "active" : ""
                }
              >
                <Link
                  href="/admin/dashboard/manage-categories"
                  onClick={handleLinkClick}
                >
                  Manage Blog Categories
                </Link>
              </li>
            </ul>
          </li>
        )}
        {hasPermission(ADMIN_PERMISSIONS.MANAGE_WEB_STORIES) && (
          <li
            className={
              activeDropdown === "dropdown5" ||
                isDropdownActive([
                  "/admin/dashboard/web-story-category",
                  "/admin/dashboard/web-story",
                ])
                ? "active"
                : ""
            }
          >
            <button
              type="button"
              onClick={(e) => toggleDropdown(e, "dropdown5")}
              aria-expanded={activeDropdown === "dropdown5"}
              className="dropdown-toggle"
            >
              <FontAwesomeIcon icon={faBookOpen} className="admin-nav-ico" />
              <span className="admin-nav-label">Web story management</span>
            </button>
            <ul
              className={`collapse list-unstyled ms-4 ${activeDropdown === "dropdown5" ||
                isDropdownActive([
                  "/admin/dashboard/web-story-category",
                  "/admin/dashboard/web-story",
                ])
                ? "show"
                : ""
                }`}
            >
              <li
                className={
                  isActive("/admin/dashboard/web-story-category") ? "active" : ""
                }
              >
                <Link
                  href="/admin/dashboard/web-story-category"
                  onClick={handleLinkClick}
                >
                  Web Story category
                </Link>
              </li>
              <li
                className={isActive("/admin/dashboard/web-story") ? "active" : ""}
              >
                <Link href="/admin/dashboard/web-story" onClick={handleLinkClick}>
                  Web Story
                </Link>
              </li>
            </ul>
          </li>
        )}
      </ul>

      {hasPermission(ADMIN_PERMISSIONS.MANAGE_PROJECTS) ? (
        <div className="sidebar-cta-wrap">
          <Link
            href="/admin/dashboard/projects/add-new-property"
            className="sidebar-new-listing-btn"
            onClick={handleLinkClick}
          >
            New listing
          </Link>
        </div>
      ) : null}

      <div className="sidebar-footer">
        {/* <Link href="/admin/dashboard/manage-projects" onClick={handleLinkClick} className="sidebar-footer-link">
          <img src="/images/admin/Setting.svg" alt="" width={17} height={17} style={{ flexShrink: 0 }} />
          <span className="sidebar-footer-text">Settings</span>
        </Link>
        <Link href="#" onClick={(e) => e.preventDefault()} title="Support" className="sidebar-footer-link">
          <img src="/images/admin/Support.svg" alt="" width={17} height={17} style={{ flexShrink: 0 }} />
          <span className="sidebar-footer-text">Support</span>
        </Link> */}
        <a
          href="#"
          className="logout-link sidebar-footer-link"
          onClick={(e) => {
            e.preventDefault();
            handleLogout();
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#78716C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span className="sidebar-footer-text">Log out</span>
        </a>
      </div>
    </nav>
  );
}
