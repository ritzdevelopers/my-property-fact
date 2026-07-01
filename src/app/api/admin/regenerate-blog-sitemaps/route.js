import { NextResponse } from "next/server";
import { getPublicApiBase } from "@/lib/publicApiBase";
import { revalidateBlogListingPages } from "@/lib/revalidateBlogs";

async function hasValidAdminSession(request) {
  const apiBase = getPublicApiBase();
  if (!apiBase) return false;

  const cookieHeader = request.headers.get("cookie") || "";
  const authorization = request.headers.get("authorization") || "";

  const headers = {
    ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    ...(authorization ? { Authorization: authorization } : {}),
  };

  if (!headers.Cookie && !headers.Authorization) {
    return false;
  }

  try {
    const res = await fetch(`${apiBase}admin-portal/auth/session`, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) return false;

    const data = await res.json();
    const roles = Array.isArray(data?.roles) ? data.roles : [];

    return roles.some((role) => {
      const normalized = String(role || "").toUpperCase();
      return (
        normalized === "SUPERADMIN" ||
        normalized === "ROLE_SUPERADMIN" ||
        normalized === "ADMIN" ||
        normalized === "ROLE_ADMIN"
      );
    });
  } catch {
    return false;
  }
}

export async function POST(request) {
  const authorized = await hasValidAdminSession(request);
  if (!authorized) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await revalidateBlogListingPages();
  const status = result.ok ? 200 : 500;

  return NextResponse.json(result, { status });
}
