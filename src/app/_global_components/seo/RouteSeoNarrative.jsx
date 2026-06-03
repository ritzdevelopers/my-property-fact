import { headers } from "next/headers";
import SeoNarrative from "./SeoNarrative";
import { getSeoNarrativeForPath } from "./seoNarratives";

export default async function RouteSeoNarrative() {
  const headersList = await headers();
  const pathname = headersList.get("x-mpf-pathname") ?? "";
  const text = getSeoNarrativeForPath(pathname);

  if (!text) return null;

  return <SeoNarrative>{text}</SeoNarrative>;
}
