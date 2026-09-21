import {
  normalizeIndianPhone,
  validateLeadFields,
} from "@/lib/leadValidation";

export const SEVEN_PEAKS_LP_PATH = "/lp/eldeco-7-peaks";
export const SEVEN_PEAKS_LP_THANKYOU_PATH = `${SEVEN_PEAKS_LP_PATH}/thank-you`;
export const SEVEN_PEAKS_LP_CRM_PROJECT_NAME = "Eldeco 7 Peaks";

const GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbyyedOH6EGMtS77DTL_DIq0dBSYW8_oLesAL08xftThDtdbYQzAl6JVjTLAZe0kAnGx/exec";
const SHEET_NAME = "Sheet1";

function getTrackingFields() {
  const query = new URLSearchParams(window.location.search);

  return {
    url: `${window.location.host}${window.location.pathname}`,
    uniqueId: `${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`,
    fld1: (query.get("utm_source") ?? "").trim(),
    fld2: (query.get("utm_campaign") ?? "").trim(),
    fld3: (query.get("utm_medium") ?? "").trim(),
    fld4: (query.get("utm_term") ?? query.get("utm_keyword") ?? "").trim(),
  };
}

function buildMessage(configuration) {
  return String(configuration || "").trim();
}

/**
 * Validate, save lead to Google Sheet, and send to CRM.
 * Sheet uses no-cors simple fetch — response body cannot be read; success = request sent.
 */
export async function submitSevenPeaksLpLead({ name, email, phone, configuration }) {
  const formData = {
    name: String(name || "").trim(),
    email: String(email || "").trim(),
    phone: normalizeIndianPhone(String(phone || "").trim()),
    message: buildMessage(configuration),
  };

  const validation = validateLeadFields(formData);
  if (!validation.isValid) {
    const error = new Error(
      validation.name ||
        validation.email ||
        validation.phone ||
        "Please check your details and try again.",
    );
    error.fieldErrors = {
      ...(validation.name ? { name: validation.name } : {}),
      ...(validation.email ? { email: validation.email } : {}),
      ...(validation.phone ? { mobile: validation.phone } : {}),
    };
    throw error;
  }

  const tracking = getTrackingFields();

  const crmPromise = fetch("/api/crm-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mob: formData.phone,
      email: formData.email,
      name: formData.name,
      project: SEVEN_PEAKS_LP_CRM_PROJECT_NAME,
      remark: formData.message,
      ...tracking,
    }),
  }).then(async (response) => {
    if (response.ok) return;
    const result = (await response.json().catch(() => ({})));
    throw new Error(result.error ?? "Could not submit to CRM. Please try again.");
  });

  const sheetBody = new FormData();
  sheetBody.append("sheetName", SHEET_NAME);
  sheetBody.append("Name", formData.name);
  sheetBody.append("Email", formData.email);
  sheetBody.append("Phone", formData.phone);
  sheetBody.append("Message", formData.message);
  sheetBody.append("Date", new Date().toString());

  const sheetPromise = fetch(GOOGLE_SHEET_URL, {
    method: "POST",
    body: sheetBody,
    mode: "no-cors",
  }).catch(() => {
    throw new Error("Could not save your enquiry. Please try again.");
  });

  await Promise.all([crmPromise, sheetPromise]);
  return { ok: true };
}

export function goToSevenPeaksLpThankYou(intent) {
  if (typeof window === "undefined") return;
  const query = intent ? `?intent=${encodeURIComponent(intent)}` : "";
  window.location.href = `${SEVEN_PEAKS_LP_THANKYOU_PATH}${query}`;
}
