import type { FormEvent } from "react";
import {
  normalizeIndianPhone,
  validateLeadFields,
} from "@/lib/leadValidation";

const GOOGLE_SCRIPT_WEB_APP_URL =
  "https://script.google.com/macros/s/AKfycbwmyV0vWMVp31JQZU8rYaa5WUIb-YRifqoPH76FzebgTmxuzSCfuibN-9O40-ogRy7-tA/exec";

function getCurrentDateTime() {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;

  return {
    date: `${day}-${month}-${year}`,
    time: `${formattedHours}:${minutes} ${period}`,
  };
}

function generateUniqueLeadId() {
  return `${Date.now()}${Math.floor(Math.random() * 9000 + 1000)}`;
}

/** Landing URL without scheme and without query string (e.g. host/path). */
function getSanitizedLandingUrl() {
  if (typeof window === "undefined") {
    return "";
  }
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

function validateLeadFormData(formData: {
  name: string;
  email: string;
  phone: string;
}) {
  const validation = validateLeadFields(formData);
  if (!validation.isValid) {
    throw new Error(
      validation.name || validation.email || validation.phone || "Invalid lead details.",
    );
  }
}

async function postToRitzGoogleCrm(payload: {
  mob: string;
  email: string;
  name: string;
  remark: string;
  url: string;
  uniqueId: string;
  fld1: string;
  fld2: string;
  fld3: string;
  fld4: string;
}) {
  const res = await fetch("/api/crm-lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = (await res.json().catch(() => ({}))) as { error?: string };

  if (!res.ok) {
    throw new Error(data.error ?? "Could not submit to CRM. Please try again.");
  }
}

export async function handleLeadFormSubmit(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  const form = event.currentTarget;
  const data = new FormData(form);
  const { date, time } = getCurrentDateTime();

  const formData = {
    name: String(data.get("name") ?? "").trim(),
    email: String(data.get("email") ?? "").trim(),
    phone: normalizeIndianPhone(String(data.get("phone") ?? "").trim()),
    message: String(data.get("message") ?? "").trim(),
    date,
    time,
  };

  validateLeadFormData(formData);

  const uniqueId = generateUniqueLeadId();
  const utm = getUtmFields();
  const landingUrl = getSanitizedLandingUrl();

  const crmPromise = postToRitzGoogleCrm({
    mob: formData.phone,
    email: formData.email,
    name: formData.name,
    remark: formData.message,
    url: landingUrl,
    uniqueId,
    fld1: utm.fld1,
    fld2: utm.fld2,
    fld3: utm.fld3,
    fld4: utm.fld4,
  });

  const sheetPromise = fetch(GOOGLE_SCRIPT_WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify(formData),
  }).then(async (response) => {
    if (!response.ok) {
      throw new Error("Could not save your enquiry. Please try again.");
    }
    return response.json();
  });

  const [, sheetJson] = await Promise.all([crmPromise, sheetPromise]);

  return sheetJson;
}
