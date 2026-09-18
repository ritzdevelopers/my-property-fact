import {
  normalizeIndianPhone,
  validateLeadFields,
} from "@/lib/leadValidation";

export const ECHOES_EDEN_LANDING_PATH = "/lp/eldeco-echoes-of-eden";
export const ECHOES_EDEN_THANKYOU_PATH = `${ECHOES_EDEN_LANDING_PATH}/thankyou`;
export const ECHOES_EDEN_CRM_PROJECT_NAME = "Eldeco Echoes of Eden";

const GOOGLE_SHEET_URL =
  "https://script.google.com/macros/s/AKfycbyGFtKW9LdwEHvwO7GTS5Ov2Ri6xFUUJs7qb0mF2FpN-ZmFjab5o4gEty8U1DuRyCQL/exec";
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

function buildMessage(homeType) {
  const preference = String(homeType || "").trim();
  if (!preference) return "Enquiry for Eldeco Echoes of Eden";
  return `Enquiry for Eldeco Echoes of Eden. Looking for: ${preference}`;
}

/**
 * Validate, save lead to Google Sheet, and send to CRM.
 * Sheet uses no-cors simple fetch — response body cannot be read; success = request sent.
 */
export async function submitEchoesEdenLead({ name, email, phone, homeType }) {
  const formData = {
    name: String(name || "").trim(),
    email: String(email || "").trim(),
    phone: normalizeIndianPhone(String(phone || "").trim()),
    message: buildMessage(homeType),
  };

  const validation = validateLeadFields(formData);
  if (!validation.isValid) {
    throw new Error(
      validation.name ||
        validation.email ||
        validation.phone ||
        "Please check your details and try again.",
    );
  }

  const tracking = getTrackingFields();

  const crmPromise = fetch("/api/crm-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mob: formData.phone,
      email: formData.email,
      name: formData.name,
      project: ECHOES_EDEN_CRM_PROJECT_NAME,
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

export function goToEchoesEdenThankYou() {
  if (typeof window === "undefined") return;
  window.location.href = ECHOES_EDEN_THANKYOU_PATH;
}
