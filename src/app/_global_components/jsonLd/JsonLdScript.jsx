export default function JsonLdScript({ data }) {
  const schemas = (Array.isArray(data) ? data : [data]).filter(Boolean);
  if (!schemas.length) return null;

  const payload = schemas.length === 1 ? schemas[0] : schemas;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
