import { NextResponse } from "next/server";
import {
  getCachedContentCatalogRows,
  getCachedFaqCatalogRows,
} from "@/lib/listingPageCatalog.server";

function matchesQuery(row, query) {
  if (!query) return true;
  const haystack = `${row.pageTitle || ""} ${row.pageSlug || ""}`.toLowerCase();
  return haystack.includes(query);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const kind = String(searchParams.get("kind") || "content").toLowerCase();
  const page = Math.max(Number(searchParams.get("page") || 0), 0);
  const size = Math.min(Math.max(Number(searchParams.get("size") || 10), 1), 100);
  const category = String(searchParams.get("category") || "all").toLowerCase();
  const query = String(searchParams.get("q") || "").trim().toLowerCase();

  try {
    const merged =
      kind === "faqs"
        ? await getCachedFaqCatalogRows(category)
        : await getCachedContentCatalogRows(category);

    const filtered = merged.filter((row) => matchesQuery(row, query));

    const from = Math.min(page * size, filtered.length);
    const to = Math.min(from + size, filtered.length);

    return NextResponse.json({
      content: filtered.slice(from, to),
      totalElements: filtered.length,
      totalPages: size ? Math.ceil(filtered.length / size) : 0,
      number: page,
      size,
    });
  } catch (error) {
    console.error("Failed to build listing page catalog:", error);
    return NextResponse.json({
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: page,
      size,
    });
  }
}
