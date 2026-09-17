/**
 * Base URL path for the Eldeco Terra & Sol app segment (`src/app/lp/Eldeco-terra&sol`).
 * Use the literal `&` — Next.js matches the folder name; `%26` 404s.
 * (`&` is only a query delimiter after `?`, so it is safe in the pathname.)
 */
export const ELDECO_LANDING_BASE_PATH = "/lp/Eldeco-terra&sol";

export const ELDECO_THANK_YOU_PATH = `${ELDECO_LANDING_BASE_PATH}/thankyou`;
export const ELDECO_CRM_PROJECT_NAME = "Eldeco Terra N Sol";
export const ELDECO_GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbzsKFbdOfCMDz4_BzJNVhkjqcni7kSaGx1tR2Tz4jpEwIq9cO4jE1wWvpox7O5BAoT__A/exec";

/** Hard navigation after form success (survives popup unmount). */
export function goToEldecoThankYou() {
  if (typeof window === "undefined") return;
  window.location.href = ELDECO_THANK_YOU_PATH;
}
