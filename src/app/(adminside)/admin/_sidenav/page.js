"use client";
import Link from "next/link";
import "./sidenav.css";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import Image from "next/image";
import axios from "axios";

export default function SideNav({ onLinkClick }) {
  const pathname = usePathname();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState(null);
  const router = useRouter();
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
      dropdown6: ["/admin/dashboard/manage-home-banners"],
    };

    Object.keys(dropdownPaths).forEach((dropdownId) => {
      if (isDropdownActive(dropdownPaths[dropdownId])) {
        setActiveDropdown(dropdownId);
      }
    });

    if (isActive("/admin/dashboard/manage-home-banners")) {
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
        `${baseUrl}auth/logout`,
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
        <Image src={"/logo.png"} alt="mpf-logo" width={100} height={100} />
      </div>
      <ul className="list-unstyled components">
        <li className={isActive("/admin/dashboard") ? "active" : ""}>
          <Link href="/admin/dashboard" onClick={handleLinkClick}>
            Dashboard
          </Link>
        </li>
        <li
          className={
            isActive("/admin/dashboard/property-approvals") ? "active" : ""
          }
        >
          <Link
            href="/admin/dashboard/property-approvals"
            onClick={handleLinkClick}
          >
            Property Approvals
          </Link>
        </li>
        <li
          className={isActive("/admin/dashboard/manage-users") ? "active" : ""}
        >
          <Link href="/admin/dashboard/manage-users" onClick={handleLinkClick}>
            Manage Users
          </Link>
        </li>
        <li
          className={
            activeDropdown === "dropdown6" ||
            isDropdownActive(["/admin/dashboard/manage-home-banners"])
              ? "active"
              : ""
          }
        >
          <Link
            href="#"
            onClick={(e) => toggleDropdown(e, "dropdown6")}
            data-toggle="collapse"
            aria-expanded="false"
            className="dropdown-toggle"
          >
            Manage Website
          </Link>
          <ul
            className={`collapse list-unstyled ms-4 ${
              activeDropdown === "dropdown6"
                ? "show"
                : ""
            }`}
          >
            <li
              className={
                activeSubDropdown === "dropdown6-home-page" ||
                isDropdownActive(["/admin/dashboard/manage-home-banners"])
                  ? "active"
                  : ""
              }
            >
              <Link
                href="#"
                onClick={(e) => toggleSubDropdown(e, "dropdown6-home-page")}
                data-toggle="collapse"
                aria-expanded="false"
                className="dropdown-toggle"
              >
                Home Page
              </Link>
              <ul
                className={`collapse list-unstyled ms-4 ${
                  activeSubDropdown === "dropdown6-home-page"
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
                    Banners
                  </Link>
                </li>
              </ul>
            </li>
          </ul>
        </li>
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
          <Link
            href="#"
            onClick={(e) => toggleDropdown(e, "dropdown3")}
            data-toggle="collapse"
            aria-expanded="false"
            className="dropdown-toggle"
          >
            Manage Options
          </Link>
          <ul
            className={`collapse list-unstyled ms-4 ${
              activeDropdown === "dropdown3" ? "show" : ""
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
          <Link
            href="#"
            data-toggle="collapse"
            aria-expanded="false"
            onClick={(e) => toggleDropdown(e, "dropdown1")}
            className="dropdown-toggle"
          >
            Management
          </Link>
          <ul
            className={`collapse list-unstyled ms-4 ${
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
            Manage Projects
          </Link>
        </li>
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
          <Link
            href="#"
            onClick={(e) => toggleDropdown(e, "dropdown2")}
            data-toggle="collapse"
            aria-expanded="false"
            className="dropdown-toggle"
          >
            Insight Management
          </Link>
          <ul
            className={`collapse list-unstyled ms-4 ${
              activeDropdown === "dropdown2" ||
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
        <li className={isActive("/admin/dashboard/aminities") ? "active" : ""}>
          <Link href="/admin/dashboard/aminities" onClick={handleLinkClick}>
            Amenities
          </Link>
        </li>
        <li
          className={
            isActive("/admin/dashboard/manage-features") ? "active" : ""
          }
        >
          <Link
            href="/admin/dashboard/manage-features"
            onClick={handleLinkClick}
          >
            Manage Features
          </Link>
        </li>
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
            Manage Nearby Benefits
          </Link>
        </li>
        <li className={isActive("/admin/dashboard/enquiries") ? "active" : ""}>
          <Link href="/admin/dashboard/enquiries" onClick={handleLinkClick}>
            Manage Enquiries
          </Link>
        </li>
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
          <Link
            href="#"
            onClick={(e) => toggleDropdown(e, "dropdown4")}
            data-toggle="collapse"
            aria-expanded="false"
            className="dropdown-toggle"
          >
            Blog management
          </Link>
          <ul
            className={`collapse list-unstyled ms-4 ${
              activeDropdown === "dropdown4" ||
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
          <Link
            href="#"
            onClick={(e) => toggleDropdown(e, "dropdown5")}
            data-toggle="collapse"
            aria-expanded="false"
            className="dropdown-toggle"
          >
            Web story management
          </Link>
          <ul
            className={`collapse list-unstyled ms-4 ${
              activeDropdown === "dropdown5" ||
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
        <li>
          <Link href="#" onClick={() => handleLogout()} className="logout-link">
            Log out
          </Link>
        </li>
      </ul>
    </nav>
  );
}
