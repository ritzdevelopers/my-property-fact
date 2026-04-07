"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell, faSearch, faTh } from "@fortawesome/free-solid-svg-icons";
import { useAdminRole } from "../_contexts/AdminRoleContext";

export default function AdminTopBar() {
  const { displayName, roleLabel, loading } = useAdminRole();
  const name =
    !loading && displayName ? displayName : loading ? "…" : "Administrator";
  const role = !loading && roleLabel ? roleLabel : "Staff";

  return (
    <header className="admin-app-topbar" aria-label="Top bar">
      <div className="admin-app-topbar__search">
        <FontAwesomeIcon icon={faSearch} className="admin-app-topbar__search-icon" />
        <input
          type="search"
          className="admin-app-topbar__search-input"
          placeholder="Search portfolios, clients, or transactions…"
          readOnly
          tabIndex={0}
          aria-label="Search (coming soon)"
          title="Search coming soon"
        />
      </div>
      <div className="admin-app-topbar__actions">
        <button
          type="button"
          className="admin-app-topbar__icon-btn"
          aria-label="Notifications"
          title="Notifications"
        >
          <FontAwesomeIcon icon={faBell} />
        </button>
        <button
          type="button"
          className="admin-app-topbar__icon-btn"
          aria-label="Apps"
          title="Apps"
        >
          <FontAwesomeIcon icon={faTh} />
        </button>
        <div className="admin-app-topbar__user">
          <div className="admin-app-topbar__user-text">
            <span className="admin-app-topbar__user-name">{name}</span>
            <span className="admin-app-topbar__user-role">{role}</span>
          </div>
          <div className="admin-app-topbar__avatar" aria-hidden>
            {name && name !== "…"
              ? String(name).trim().charAt(0).toUpperCase()
              : "A"}
          </div>
        </div>
      </div>
    </header>
  );
}
