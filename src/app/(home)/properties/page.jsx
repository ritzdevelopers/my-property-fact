import Properties from "./properties";
import { transformPublicPropertyList } from "./transformPublicProperties";

async function loadPublicProperties() {
  const raw = process.env.NEXT_PUBLIC_API_URL || "";
  const base = raw.endsWith("/") ? raw.slice(0, -1) : raw;
  if (!base) {
    return { list: [], error: "API URL is not configured" };
  }
  try {
    const res = await fetch(`${base}/public/properties`, {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    if (data.success && Array.isArray(data.properties)) {
      return {
        list: transformPublicPropertyList(data.properties),
        error: null,
      };
    }
    return {
      list: [],
      error: data.message || "Failed to load properties",
    };
  } catch (e) {
    return {
      list: [],
      error: e?.message || "Failed to load properties",
    };
  }
}

export default async function PropertiesPage() {
  const { list, error } = await loadPublicProperties();
  return (
    <Properties initialProperties={list} initialLoadError={error} />
  );
}
