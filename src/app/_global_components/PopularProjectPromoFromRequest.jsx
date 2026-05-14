import { headers } from "next/headers";
import PopularProjectPromo from "./PopularProjectPromo";

/** Skips promo when middleware sets x-mpf-hide-popular-promo (e.g. Eldeco Terra & Sol landing). */
export default async function PopularProjectPromoFromRequest() {
  const h = await headers();
  if (h.get("x-mpf-hide-popular-promo") === "1") return null;
  return <PopularProjectPromo />;
}
