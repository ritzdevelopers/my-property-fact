"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  ChevronRight,
  Home,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Plus,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";
import sidenavConfig from "./sidenav-config.json";
import { useUser } from "../_contexts/UserContext";
import PortalUserAvatar from "./PortalUserAvatar";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { getUserDisplayName, getUserRoleLabel } from "../_utils/userDisplay";
import "./PortalSidebar.css";

const ICONS = {
  dashboard: LayoutDashboard,
  listings: Building2,
  leads: Users,
  compliance: ShieldCheck,
  profile: UserRound,
  notifications: Bell,
  help: LifeBuoy,
};

function isItemActive(item, pathname) {
  if (!pathname) return false;
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export default function ModernPortalSidenav({ onNavigate }) {
  const pathname = usePathname();
  const { userData, logout } = useUser();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    await logout("/");
  };

  return (
    <>
      <aside className="brk-side">
        <div className="brk-side__head">
          <Link href="/portal/dashboard" className="brk-side__brand" onClick={onNavigate}>
            <img src="/logo.webp" alt="" width={34} height={34} className="brk-side__logo" />
            <span className="brk-side__brand-text">
              <span className="brk-side__brand-title">Broker Portal</span>
              <span className="brk-side__brand-sub">My Property Fact</span>
            </span>
          </Link>
          {onNavigate && (
            <button
              type="button"
              className="brk-side__close"
              onClick={onNavigate}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="brk-side__cta-wrap">
          <Link
            href={sidenavConfig.primaryAction.href}
            className="brk-side__cta"
            onClick={onNavigate}
          >
            <Plus size={16} />
            {sidenavConfig.primaryAction.label}
          </Link>
        </div>

        <nav className="brk-side__nav" aria-label="Portal navigation">
          {sidenavConfig.sections.map((section) => (
            <div key={section.id} className="brk-side__group">
              <p className="brk-side__group-label">{section.label}</p>
              <ul className="brk-side__list">
                {section.items.map((item) => {
                  const Icon = ICONS[item.icon] || Home;
                  const active = isItemActive(item, pathname);
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        title={item.label}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={`brk-side__link${active ? " is-active" : ""}`}
                      >
                        <Icon size={17} className="brk-side__link-icon" />
                        <span className="brk-side__link-text">{item.label}</span>
                        {item.badge && <span className="brk-side__badge">{item.badge}</span>}
                        <ChevronRight size={14} className="brk-side__chevron" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="brk-side__foot">
          <Link href="/portal/dashboard/profile" className="brk-side__user" onClick={onNavigate}>
            <PortalUserAvatar userData={userData} size="sm" />
            <span className="brk-side__user-meta">
              <span className="brk-side__user-name">{getUserDisplayName(userData)}</span>
              <span className="brk-side__user-role">{getUserRoleLabel(userData)}</span>
            </span>
          </Link>
          <button
            type="button"
            className="brk-side__logout"
            onClick={() => setLogoutOpen(true)}
            aria-label="Log out"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      <LogoutConfirmModal
        open={logoutOpen}
        busy={loggingOut}
        onCancel={() => setLogoutOpen(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
