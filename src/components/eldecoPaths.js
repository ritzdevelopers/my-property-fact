/**
 * Base URL path for the Eldeco Terra & Sol app segment (`src/app/Eldeco-terra&sol`).
 * Use the literal `&` — Next.js matches the folder name; `%26` 404s.
 * (`&` is only a query delimiter after `?`, so it is safe in the pathname.)
 */
export const ELDECO_LANDING_BASE_PATH = "/Eldeco-terra&sol";

export const ELDECO_THANK_YOU_PATH = `${ELDECO_LANDING_BASE_PATH}/thankyou`;

/** Hard navigation after form success (survives popup unmount). */
export function goToEldecoThankYou() {
  if (typeof window === "undefined") return;
  window.location.href = ELDECO_THANK_YOU_PATH;
}
