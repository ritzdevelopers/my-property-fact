import {
  normalizeIndianPhone,
  validateLeadFields,
} from "@/lib/leadValidation";
import { sevenPeaksConfig } from "@/app/eldeco-7-peaks/config";

/** Letters, numbers, spaces, and light punctuation only. */
const SAFE_TEXT_REGEX = /^[a-zA-Z0-9\s.,!?'\-]+$/;

const BLOCKED_MESSAGE_WORDS = new Set([
  "fuck",
  "fucker",
  "fucking",
  "shit",
  "bitch",
  "asshole",
  "bastard",
  "dick",
  "pussy",
  "cunt",
  "slut",
  "whore",
  "nigger",
  "nigga",
  "chutiya",
  "madarchod",
  "behenchod",
  "bhosdike",
  "randi",
  "gaand",
  "lund",
]);

export class EnquiryValidationError extends Error {
  constructor(fieldErrors) {
    const message =
      fieldErrors.name ||
      fieldErrors.email ||
      fieldErrors.phone ||
      fieldErrors.message ||
      "Please check the form and try again.";
    super(message);
    this.name = "EnquiryValidationError";
    this.fieldErrors = fieldErrors;
  }
}

export function extractEnquiryValues(form) {
  const data = new FormData(form);

  return {
    name: String(data.get("name") ?? "").trim(),
    email: String(data.get("email") ?? "").trim(),
    phone: String(data.get("phone") ?? "").trim(),
    message: String(data.get("message") ?? "").trim(),
  };
}

function containsBlockedWord(text) {
  const tokens = String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

  return tokens.some((token) => BLOCKED_MESSAGE_WORDS.has(token));
}

export function validateLeadMessage(message) {
  const trimmed = String(message || "").trim();
  if (!trimmed) return "";

  if (trimmed.length > 500) {
    return "Message must be 500 characters or less";
  }

  if (!SAFE_TEXT_REGEX.test(trimmed)) {
    return "Message can only contain letters, numbers, spaces, and basic punctuation";
  }

  if (containsBlockedWord(trimmed)) {
    return "Please remove inappropriate language from your message";
  }

  return "";
}

export function validateEnquiryForm(values) {
  const fieldValidation = validateLeadFields({
    name: values.name,
    email: values.email,
    phone: values.phone,
  });

  const fieldErrors = {};

  if (fieldValidation.name) {
    fieldErrors.name = fieldValidation.name;
  } else if (containsBlockedWord(values.name)) {
    fieldErrors.name = "Please enter a valid name";
  }

  if (fieldValidation.email) fieldErrors.email = fieldValidation.email;
  if (fieldValidation.phone) fieldErrors.phone = fieldValidation.phone;

  const messageError = validateLeadMessage(values.message);
  if (messageError) fieldErrors.message = messageError;

  return fieldErrors;
}

function generateUniqueLeadId() {
  return `${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
}

/** Landing URL without scheme and without query string. */
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

function buildSheetPayload(values) {
  const phone = normalizeIndianPhone(values.phone);
  const now = new Date();
  const formData = new FormData();

  formData.append("sheetName", sevenPeaksConfig.sheetName);
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

export async function submitEnquiryToGoogleSheet(values) {
  const body = buildSheetPayload(values);

  try {
    await fetch(sevenPeaksConfig.scriptUrl, {
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

async function submitEnquiryToRitzGoogleCrm(values) {
  const phone = normalizeIndianPhone(values.phone);
  const utm = getUtmFields();

  const res = await fetch("/api/crm-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mob: phone,
      email: values.email,
      name: values.name,
      city: sevenPeaksConfig.crm.city,
      location: sevenPeaksConfig.crm.location,
      project: sevenPeaksConfig.crm.project,
      remark: values.message,
      url: getSanitizedLandingUrl(),
      uniqueId: generateUniqueLeadId(),
      fld1: utm.fld1,
      fld2: utm.fld2,
      fld3: utm.fld3,
      fld4: utm.fld4,
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error ?? "Could not submit to CRM. Please try again.");
  }
}

export async function submitValidatedEnquiry(form) {
  const values = extractEnquiryValues(form);
  const fieldErrors = validateEnquiryForm(values);

  if (Object.keys(fieldErrors).length > 0) {
    throw new EnquiryValidationError(fieldErrors);
  }

  await Promise.all([
    submitEnquiryToGoogleSheet(values),
    submitEnquiryToRitzGoogleCrm(values),
  ]);
}
