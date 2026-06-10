/** Safe JSON-LD string for inline script tags (Next.js recommendation). */
export function serializeJsonLd(data) {
  const schemas = (Array.isArray(data) ? data : [data]).filter(Boolean);
  if (!schemas.length) return null;
  const payload = schemas.length === 1 ? schemas[0] : schemas;
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

export default function JsonLdScript({ data }) {
  const html = serializeJsonLd(data);
  if (!html) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
