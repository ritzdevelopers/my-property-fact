import { sanitizeHtml } from "@/app/_global_components/sanitize";

export default function ListingPageSeoContent({ content }) {
  const html = sanitizeHtml(String(content?.content || "").trim());
  if (!html) return null;

  return (
    <section className="listing-seo-content" aria-label="Page information">
      <div className="listing-seo-content__box">
        <div
          className="listing-seo-content__body"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </section>
  );
}
