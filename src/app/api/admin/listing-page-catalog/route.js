import { NextResponse } from "next/server";
import {
  fetchContentSummaries,
  fetchFaqSummaries,
  getCachedListingPageOptions,
} from "@/lib/listingPageCatalog.server";
import {
  getListingPageCategory,
  getListingPageCategoryLabel,
} from "@/lib/listingPageSlugOptions";

function matchesQuery(row, query) {
  if (!query) return true;
  const haystack = `${row.pageTitle || ""} ${row.pageSlug || ""}`.toLowerCase();
  return haystack.includes(query);
}

function buildFaqRows(options, summaries) {
  const savedBySlug = new Map();
  summaries.forEach((row) => {
    if (row?.pageSlug) savedBySlug.set(row.pageSlug, row);
  });

  const rows = (options || []).map((option) => {
    const saved = savedBySlug.get(option.pageSlug);
    return {
      pageSlug: option.pageSlug,
      pageTitle: saved?.pageTitle || option.pageTitle,
      noOfFaqs: Number(saved?.noOfFaqs) || 0,
      category: getListingPageCategory(option.pageSlug),
      categoryLabel: getListingPageCategoryLabel(option.pageSlug),
    };
  });

  const known = new Set(rows.map((row) => row.pageSlug));
  summaries.forEach((saved) => {
    if (!saved?.pageSlug || known.has(saved.pageSlug)) return;
    rows.push({
      pageSlug: saved.pageSlug,
      pageTitle: saved.pageTitle || saved.pageSlug,
      noOfFaqs: Number(saved.noOfFaqs) || 0,
      category: getListingPageCategory(saved.pageSlug),
      categoryLabel: getListingPageCategoryLabel(saved.pageSlug),
    });
  });

  return rows;
}

function buildContentRows(options, summaries) {
  const savedBySlug = new Map();
  summaries.forEach((row) => {
    if (row?.pageSlug) savedBySlug.set(row.pageSlug, row);
  });

  const rows = (options || []).map((option) => {
    const saved = savedBySlug.get(option.pageSlug);
    return {
      pageSlug: option.pageSlug,
      pageTitle: saved?.pageTitle || option.pageTitle,
      heading: saved?.heading || "",
      metaTitle: saved?.metaTitle || "",
      recordId: saved?.id || 0,
      hasContent: Boolean(saved?.hasContent),
      category: getListingPageCategory(option.pageSlug),
      categoryLabel: getListingPageCategoryLabel(option.pageSlug),
    };
  });

  const known = new Set(rows.map((row) => row.pageSlug));
  summaries.forEach((saved) => {
    if (!saved?.pageSlug || known.has(saved.pageSlug)) return;
    rows.push({
      pageSlug: saved.pageSlug,
      pageTitle: saved.pageTitle || saved.pageSlug,
      heading: saved.heading || "",
      metaTitle: saved.metaTitle || "",
      recordId: saved.id || 0,
      hasContent: Boolean(saved.hasContent),
      category: getListingPageCategory(saved.pageSlug),
      categoryLabel: getListingPageCategoryLabel(saved.pageSlug),
    });
  });

  return rows;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const kind = String(searchParams.get("kind") || "content").toLowerCase();
  const page = Math.max(Number(searchParams.get("page") || 0), 0);
  const size = Math.min(Math.max(Number(searchParams.get("size") || 10), 1), 100);
  const category = String(searchParams.get("category") || "all").toLowerCase();
  const query = String(searchParams.get("q") || "").trim().toLowerCase();

  try {
    const [options, summaries] = await Promise.all([
      getCachedListingPageOptions(),
      kind === "faqs" ? fetchFaqSummaries() : fetchContentSummaries(),
    ]);

    const merged =
      kind === "faqs"
        ? buildFaqRows(options, summaries)
        : buildContentRows(options, summaries);

    const filtered = merged.filter((row) => {
      if (category !== "all" && row.category !== category) return false;
      return matchesQuery(row, query);
    });

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
