"use client";

import { getUserInitials } from "../_utils/userDisplay";
import "./PortalUserAvatar.css";

export default function PortalUserAvatar({ userData, size = "md", className = "" }) {
  const initials = getUserInitials(userData);
  const avatarUrl = userData?.avatar;

  if (avatarUrl && avatarUrl !== "/logo_flag_color.png") {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`portal-user-avatar portal-user-avatar--${size} ${className}`.trim()}
      />
    );
  }

  return (
    <span
      className={`portal-user-avatar portal-user-avatar--initials portal-user-avatar--${size} ${className}`.trim()}
      aria-hidden
    >
      {initials}
    </span>
  );
}
