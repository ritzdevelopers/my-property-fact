/** Broker/Owner accounts created from the public portal (not admin CMS users). */
export function isPortalManagedUser(user) {
  const category = String(user?.userCategory || "").trim().toUpperCase();
  if (category === "PORTAL_USER") return true;

  const roleNames = (user?.roles || [])
    .map((r) => String(r?.roleName ?? r ?? "").toUpperCase().replace(/^ROLE_/, ""))
    .filter(Boolean);

  return roleNames.includes("BROKER") || roleNames.includes("OWNER") || roleNames.includes("PROPERTY_OWNER");
}
