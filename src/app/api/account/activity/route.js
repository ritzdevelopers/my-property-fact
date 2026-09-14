import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/?$/, "/");

function tokenFromCookies(store) {
  return store.get("token")?.value || store.get("accessToken")?.value || "";
}

export async function GET() {
  const store = await cookies();
  const token = tokenFromCookies(store);
  if (!token) {
    return NextResponse.json({ viewedCount: 0, shortlistedCount: 0, recent: [] });
  }
  try {
    const res = await fetch(`${API_BASE}user/activity`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { message: error?.message || "Could not load activity" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  const store = await cookies();
  const token = tokenFromCookies(store);
  if (!token) {
    return NextResponse.json({ success: true, stored: "local" });
  }
  try {
    const body = await request.json();
    const res = await fetch(`${API_BASE}user/activity`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { message: error?.message || "Could not save activity" },
      { status: 500 },
    );
  }
}
