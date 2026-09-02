import {
  normalizeIndianPhone,
  validateLeadFields,
} from "@/lib/leadValidation";
import { googleSheetConfig } from "@/eldeco-echoes-of-eden/config/googleSheet";

export type EnquiryFormValues = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

export type EnquiryFieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  consent?: string;
};

export class EnquiryValidationError extends Error {
  fieldErrors: EnquiryFieldErrors;

  constructor(fieldErrors: EnquiryFieldErrors) {
    const message =
      fieldErrors.name ||
      fieldErrors.email ||
      fieldErrors.phone ||
      fieldErrors.consent ||
      "Please check the form and try again.";
    super(message);
    this.name = "EnquiryValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export function extractEnquiryValues(
  form: HTMLFormElement,
): EnquiryFormValues {
  const data = new FormData(form);

  return {
    name: String(data.get("name") ?? "").trim(),
    email: String(data.get("email") ?? "").trim(),
    phone: String(data.get("phone") ?? "").trim(),
    message: String(data.get("message") ?? "").trim(),
  };
}

export function validateEnquiryForm(
  values: EnquiryFormValues,
  consentChecked: boolean,
): EnquiryFieldErrors {
  const fieldValidation = validateLeadFields({
    name: values.name,
    email: values.email,
    phone: values.phone,
  });

  const fieldErrors: EnquiryFieldErrors = {};

  if (fieldValidation.name) fieldErrors.name = fieldValidation.name;
  if (fieldValidation.email) fieldErrors.email = fieldValidation.email;
  if (fieldValidation.phone) fieldErrors.phone = fieldValidation.phone;
  if (!consentChecked) {
    fieldErrors.consent = "Please accept the consent to continue.";
  }

  return fieldErrors;
}

function generateUniqueLeadId() {
  return `${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
}

/** Landing URL without scheme and without query string (e.g. host/path). */
function getSanitizedLandingUrl() {
  if (typeof window === "undefined") return "";
  const { host, pathname } = window.location;
  return `${host}${pathname}`;
}

function getUtmFields() {
  if (typeof window === "undefined") {
    return { fld1: "", fld2: "", fld3: "", fld4: "" };
  }

  const q = new URLSearchParams(window.location.search);
  return {
    fld1: (q.get("utm_source") ?? "").trim(),
    fld2: (q.get("utm_campaign") ?? "").trim(),
    fld3: (q.get("utm_medium") ?? "").trim(),
    fld4: (q.get("utm_term") ?? q.get("utm_keyword") ?? "").trim(),
  };
}

function buildSheetPayload(values: EnquiryFormValues) {
  const phone = normalizeIndianPhone(values.phone);
  const now = new Date();
  const formData = new FormData();

  formData.append("sheetName", googleSheetConfig.sheetName);
  formData.append("Name", values.name);
  formData.append("Email", values.email);
  formData.append("Phone", phone);
  formData.append("Message", values.message || "No Message");
  formData.append(
    "Time",
    now.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  );
  formData.append("Date", now.toLocaleDateString("en-US"));

  return formData;
}

/**
 * Simple POST to Google Apps Script using FormData (no custom headers).
 * mode: "no-cors" avoids CORS preflight; response is opaque so success is inferred from a completed request.
 */
export async function submitEnquiryToGoogleSheet(
  values: EnquiryFormValues,
): Promise<void> {
  const body = buildSheetPayload(values);

  try {
    await fetch(googleSheetConfig.scriptUrl, {
      method: "POST",
      body,
      mode: "no-cors",
    });
  } catch {
    throw new Error(
      "Unable to submit your enquiry right now. Please check your connection and try again.",
    );
  }
}

/**
 * Ritz Google (4qt) CRM via server proxy — Channel=RGA, params in query string.
 * Credentials stay server-side; not called directly from the browser.
 */
async function submitEnquiryToRitzGoogleCrm(
  values: EnquiryFormValues,
): Promise<void> {
  const phone = normalizeIndianPhone(values.phone);
  const utm = getUtmFields();

  const res = await fetch("/api/crm-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mob: phone,
      email: values.email,
      name: values.name,
      city: googleSheetConfig.crm.city,
      location: googleSheetConfig.crm.location,
      project: googleSheetConfig.crm.project,
      remark: values.message,
      url: getSanitizedLandingUrl(),
      uniqueId: generateUniqueLeadId(),
      fld1: utm.fld1,
      fld2: utm.fld2,
      fld3: utm.fld3,
      fld4: utm.fld4,
    }),
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string };

  if (!res.ok) {
    throw new Error(
      data.error ?? "Could not submit to CRM. Please try again.",
    );
  }
}

export async function submitValidatedEnquiry(
  form: HTMLFormElement,
  consentChecked: boolean,
): Promise<void> {
  const values = extractEnquiryValues(form);
  const fieldErrors = validateEnquiryForm(values, consentChecked);

  if (Object.keys(fieldErrors).length > 0) {
    throw new EnquiryValidationError(fieldErrors);
  }

  await Promise.all([
    submitEnquiryToGoogleSheet(values),
    submitEnquiryToRitzGoogleCrm(values),
  ]);
}
