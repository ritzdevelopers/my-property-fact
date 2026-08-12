"use client";

import { usePathname } from "next/navigation";
import NewFooterDesign from "./NewFooterDesign";

/** Routes where the newsletter block is dropped from the footer. */
const NO_NEWSLETTER_PREFIXES = ["/city/"];

export default function SiteFooter() {
  const pathname = usePathname() || "";
  const showNewsletter = !NO_NEWSLETTER_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  return <NewFooterDesign showNewsletter={showNewsletter} />;
}
