import WebStroy from "./webStroy";

// Generating Meta Title, Meta Description and Meta Keywords dynamically for the <head> tag
export async function generateMetadata({ params }) {
    const { "web-story": storySlug } = await params;

    let storyData = null;
    try {
        // NOTE: Please ensure this is the exact URL your backend uses to get a single story / category detail
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}web-story/get/${storySlug}`, {
            cache: "no-store" // Bypass Next.js cache so DB updates show instantly
        });
        if (response.ok) {
            storyData = await response.json();
        }
    } catch (error) {
        console.error("Error fetching web story metadata:", error);
    }

    if (!storyData) {
        return {
            title: Object.hasOwn(params, "web-story") ? storySlug.replaceAll("-", " ").toUpperCase() : "Web Story | My Property Fact",
            description: "View our latest web stories.",
        };
    }

    return {
        title: storyData?.metaTitle || storyData?.storyTitle || storyData?.categoryName || "Web Story | My Property Fact",
        description: storyData?.metaDescription || storyData?.categoryDescription || "Explore our latest web stories.",
        keywords: storyData?.metaKeywords || "real estate, property, stories",
        alternates: {
            canonical: `/stories/${storySlug}`,
        },
    };
}

export default async function WebStoryPage({ params }) {
    const { "web-story": storySlug } = await params;

    return (
        <main className="w-full h-screen overflow-hidden">
            <WebStroy storySlug={storySlug} />
        </main>
    );
}