import { fetchBlogBySlug } from "@/app/_global_components/masterFunction";
import { serializeJsonLd } from "@/app/_global_components/jsonLd/JsonLdScript";
import {
  buildBlogArticleJsonLd,
  buildFaqJsonLd,
  normalizeFaqItems,
  resolveBlogFaqRawList,
} from "@/app/_global_components/jsonLd/buildJsonLd";

export default async function Head({ params }) {
  const { blogpage } = params || {};
  const blogDetail = await fetchBlogBySlug(blogpage);
  if (!blogDetail) return null;

  const articleSchema = buildBlogArticleJsonLd(blogDetail);
  const faqSchema = buildFaqJsonLd(
    normalizeFaqItems(resolveBlogFaqRawList(blogDetail)),
  );
  const articleHtml = serializeJsonLd(articleSchema);
  const faqHtml = serializeJsonLd(faqSchema);

  return (
    <>
      {articleHtml ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: articleHtml }}
        />
      ) : null}
      {faqHtml ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: faqHtml }}
        />
      ) : null}
    </>
  );
}

