import Cookies from "js-cookie";
import { getAccessToken } from "@/lib/apiAuth";
import { recordBrowsedItem } from "@/app/_global_components/smartSearchParser";

export const AUTH_CHANGED_EVENT = "mpf-auth-changed";
export const ACTIVITY_CHANGED_EVENT = "mpf-activity-changed";
export const VIEWED_KEY = "mpf-viewed-projects";
export const SHORTLIST_KEY = "mpf-shortlisted-projects";
const STORE_LIMIT = 80;

function emitActivityChange() {
  if (typeof window === "undefined") return;
  try {
    window.dispatchEvent(new Event(ACTIVITY_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

function readStore(key) {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStore(key, items) {
  localStorage.setItem(key, JSON.stringify(items.slice(0, STORE_LIMIT)));
  emitActivityChange();
}

function itemKey(item) {
  return String(item?.slug || item?.id || item?.label || "").toLowerCase();
}

function upsert(key, item) {
  if (!item?.label && !item?.slug) return;
  const nextItem = {
    id: item.id || item.slug || item.label,
    slug: item.slug || "",
    label: item.label || item.name || item.slug || "Property",
    href: item.href || (item.slug ? `/${item.slug}` : ""),
    at: Date.now(),
  };
  const existing = readStore(key).filter((row) => itemKey(row) !== itemKey(nextItem));
  writeStore(key, [nextItem, ...existing]);
  return nextItem;
}

function isLoggedIn() {
  return Boolean(getAccessToken());
}

async function postActivity(payload) {
  if (!isLoggedIn()) return null;
  try {
    const res = await fetch("/api/account/activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function getLocalActivityCounts() {
  return {
    viewed: readStore(VIEWED_KEY).length,
    shortlisted: readStore(SHORTLIST_KEY).length,
  };
}

export function getLocalViewed() {
  return readStore(VIEWED_KEY);
}

export function getLocalShortlisted() {
  return readStore(SHORTLIST_KEY);
}

export function isShortlisted(slugOrId) {
  const needle = String(slugOrId || "").toLowerCase();
  if (!needle) return false;
  return readStore(SHORTLIST_KEY).some((row) => itemKey(row) === needle);
}

export async function recordProjectView(item) {
  const stored = upsert(VIEWED_KEY, item);
  if (stored) {
    recordBrowsedItem({
      label: stored.label,
      kind: "property",
      href: stored.href,
    });
  }
  await postActivity({
    type: "VIEW",
    entityType: "PROJECT",
    entityId: item?.id != null ? String(item.id) : "",
    entitySlug: item?.slug || "",
    entityLabel: stored?.label || item?.label,
    href: stored?.href || "",
  });
}

export async function toggleProjectShortlist(item) {
  const needle = itemKey(item);
  const current = readStore(SHORTLIST_KEY);
  const exists = current.some((row) => itemKey(row) === needle);
  if (exists) {
    writeStore(
      SHORTLIST_KEY,
      current.filter((row) => itemKey(row) !== needle),
    );
    await postActivity({
      type: "SHORTLIST",
      action: "remove",
      entityType: "PROJECT",
      entityId: item?.id != null ? String(item.id) : "",
      entitySlug: item?.slug || "",
      entityLabel: item?.label || item?.name,
      href: item?.href || (item?.slug ? `/${item.slug}` : ""),
    });
    return false;
  }
  upsert(SHORTLIST_KEY, item);
  await postActivity({
    type: "SHORTLIST",
    action: "add",
    entityType: "PROJECT",
    entityId: item?.id != null ? String(item.id) : "",
    entitySlug: item?.slug || "",
    entityLabel: item?.label || item?.name,
    href: item?.href || (item?.slug ? `/${item.slug}` : ""),
  });
  return true;
}

export async function fetchActivitySummary() {
  if (!isLoggedIn()) return null;
  try {
    const res = await fetch("/api/account/activity", { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function syncLocalActivityOnLogin() {
  if (!isLoggedIn()) return;
  const viewed = getLocalViewed();
  const shortlisted = getLocalShortlisted();
  await Promise.all([
    ...viewed.slice(0, 20).map((item) =>
      postActivity({
        type: "VIEW",
        entityType: "PROJECT",
        entityId: item.id != null ? String(item.id) : "",
        entitySlug: item.slug || "",
        entityLabel: item.label,
        href: item.href || "",
      }),
    ),
    ...shortlisted.slice(0, 20).map((item) =>
      postActivity({
        type: "SHORTLIST",
        action: "add",
        entityType: "PROJECT",
        entityId: item.id != null ? String(item.id) : "",
        entitySlug: item.slug || "",
        entityLabel: item.label,
        href: item.href || "",
      }),
    ),
  ]);
}

export function authCookieOptions() {
  return {
    expires: 7,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  };
}

export function saveWebsiteAuth(data) {
  const token = data?.token || data?.accessToken;
  if (token) Cookies.set("token", token, authCookieOptions());
  if (data?.refreshToken) Cookies.set("refreshToken", data.refreshToken, authCookieOptions());
  if (data?.user) Cookies.set("userData", JSON.stringify(data.user), authCookieOptions());
}
