import Cookies from "js-cookie";


export function adminApiWithAuth() {
  return { withCredentials: true };
}

export function adminFetchHeaders(extra = {}) {
  return { ...extra };
}

export function clearLegacyAdminTokenCookies() {
  if (typeof window === "undefined") return;
  const domains = [undefined, "mypropertyfact.in", ".mypropertyfact.in"];
  for (const name of ["token", "refreshToken"]) {
    for (const domain of domains) {
      Cookies.remove(name, domain ? { path: "/", domain } : { path: "/" });
    }
  }
}
