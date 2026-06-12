"use server";

import { fetchBlogGetAll } from "@/app/_global_components/masterFunction";

function normalizeBlogListPayload(raw) {
  if (Array.isArray(raw)) return raw;
  return raw?.content ?? raw?.data ?? raw?.blogs ?? [];
}

/**
 * Sidebar blog search: loads data on the server so the browser never calls blog/get-all directly.
 */
export async function searchBlogsAction(query) {
  const q = String(query ?? "").trim().toLowerCase();
  if (q.length < 2) return [];

  try {
    const allBlogs = await fetchBlogGetAll();
    const list = normalizeBlogListPayload(allBlogs);
    return list
      .filter((b) => Number(b?.status) === 1)
      .filter((b) => {
        const t = (b.blogTitle || "").toLowerCase();
        const d = (b.blogMetaDescription || "").toLowerCase();
        return t.includes(q) || d.includes(q);
      })
      .slice(0, 8);
  } catch {
    return [];
  }
}

export async function submitBlogEnquiryAction(formData) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return { ok: false, message: "Server configuration error" };
  }
  try {
    const res = await fetch(`${apiUrl}enquiry/post`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });
    const data = await res.json().catch(() => ({}));
    const ok = data.isSuccess === 1;
    return {
      ok,
      message: data.message || (ok ? "Submitted" : "Something went wrong"),
    };
  } catch (e) {
    return {
      ok: false,
      message: e?.message || "Network error",
    };
  }
}
