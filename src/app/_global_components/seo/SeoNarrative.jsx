/**
 * Server-rendered page summary for crawlers and assistive tech.
 * Visually hidden — does not change layout or design.
 */
export default function SeoNarrative({ children, as: Tag = "p" }) {
  const text =
    typeof children === "string"
      ? children.trim()
      : Array.isArray(children)
        ? children.filter(Boolean).join(" ").trim()
        : "";

  if (!text) return null;

  return <Tag className="mpf-seo-sr">{text}</Tag>;
}
