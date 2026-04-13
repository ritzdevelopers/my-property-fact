import WebStroy from "./webStroy";
import { notFound } from "next/navigation";

function publicSiteOrigin() {
  const raw = process.env.NEXT_PUBLIC_UI_URL;
  if (raw && String(raw).trim()) {
    return String(raw).trim().replace(/\/+$/, "");
  }
  return "https://mypropertyfact.in";
}

async function fetchStoryCategory(storySlug) {
    const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}web-story-category/get/${storySlug}`,
        { cache: "no-store" }
    );
    if (!response.ok) return null;
    return response.json();
}

// Generating Meta Title, Meta Description and Meta Keywords dynamically for the <head> tag
export async function generateMetadata({ params }) {
    const { "web-story": storySlug } = await params;
    const canonicalPath = `/stories/${storySlug}`;
    const base = publicSiteOrigin();
    const canonicalUrl = `${base}${canonicalPath}`;

    let storyData = null;
    try {
        storyData = await fetchStoryCategory(storySlug);
    } catch (error) {
        console.error("Error fetching web story metadata:", error);
    }

    if (!storyData) {
        return {
            title: Object.hasOwn(params, "web-story") ? storySlug.replaceAll("-", " ").toUpperCase() : "Web Story | My Property Fact",
            description: "View our latest web stories.",
            alternates: {
                canonical: canonicalUrl,
                languages: {
                    "en-IN": canonicalUrl,
                    en: canonicalUrl,
                    "x-default": canonicalUrl,
                },
            },
        };
    }

    return {
        title: storyData?.metaTitle || storyData?.storyTitle || storyData?.categoryName || "Web Story | My Property Fact",
        description: storyData?.metaDescription || storyData?.categoryDescription || "Explore our latest web stories.",
        keywords: storyData?.metaKeywords || "real estate, property, stories",
        alternates: {
            canonical: canonicalUrl,
            languages: {
                "en-IN": canonicalUrl,
                en: canonicalUrl,
                "x-default": canonicalUrl,
            },
        },
    };
}

export default async function WebStoryPage({ params }) {
    const { "web-story": storySlug } = await params;
    const storyData = await fetchStoryCategory(storySlug);
    const hasSlides =
        Array.isArray(storyData?.webStories) && storyData.webStories.length > 0;
    if (!storyData || !hasSlides) {
        notFound();
    }

    return (
        <main className="w-full h-screen overflow-hidden" lang="en-IN">
            <WebStroy storySlug={storySlug} storyData={storyData} />
        </main>
    );
}