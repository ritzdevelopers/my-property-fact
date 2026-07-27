/**
 * Shared helpers for displaying user identity across the broker portal.
 */

export function getUserDisplayName(userData) {
  const name =
    userData?.fullName?.trim() ||
    userData?.name?.trim() ||
    userData?.email?.split("@")[0] ||
    "";
  return name || "Broker";
}

export function getUserInitials(userData) {
  const name = getUserDisplayName(userData);
  if (!name || name === "Broker") return "B";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].slice(0, 2).toUpperCase();
}

export function getUserRoleLabel(userData) {
  const persona = userData?.userType || userData?.role;
  if (persona === "OWNER") return "Property Owner";
  if (persona === "BROKER") return "Broker / Agent";
  if (typeof persona === "string" && persona.length > 0) {
    return persona.charAt(0) + persona.slice(1).toLowerCase().replace(/_/g, " ");
  }
  return "Member";
}

export function getUserContactLine(userData) {
  if (userData?.email) return userData.email;
  if (userData?.phone) return userData.phone;
  return null;
}
