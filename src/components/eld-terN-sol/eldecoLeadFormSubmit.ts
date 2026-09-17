import type { FormEvent } from "react";
import {
  normalizeIndianPhone,
  validateLeadFields,
} from "@/lib/leadValidation";
import {
  ELDECO_CRM_PROJECT_NAME,
  ELDECO_GOOGLE_SHEET_NAME,
  ELDECO_GOOGLE_SHEET_URL,
} from "../eldecoPaths";

const ENABLE_CRM_SUBMISSION = false;

function getCurrentDateTime() {
  const now = new Date();
  const hours = now.getHours();

  return {
    date: `${String(now.getDate()).padStart(2, "0")}-${String(
      now.getMonth() + 1,
    ).padStart(2, "0")}-${now.getFullYear()}`,
    time: `${hours % 12 || 12}:${String(now.getMinutes()).padStart(2, "0")} ${
      hours >= 12 ? "PM" : "AM"
    }`,
  };
}

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

export async function handleEldecoLeadFormSubmit(
  event: FormEvent<HTMLFormElement>,
) {
  event.preventDefault();

  const data = new FormData(event.currentTarget);
  const formData = {
    name: String(data.get("name") ?? "").trim(),
    email: String(data.get("email") ?? "").trim(),
    phone: normalizeIndianPhone(String(data.get("phone") ?? "").trim()),
    message: String(data.get("message") ?? "").trim(),
    ...getCurrentDateTime(),
  };

  const validation = validateLeadFields(formData);
  if (!validation.isValid) {
    throw new Error(
      validation.name ||
        validation.email ||
        validation.phone ||
        "Invalid lead details.",
    );
  }

  const tracking = getTrackingFields();
  const crmPromise = ENABLE_CRM_SUBMISSION
    ? fetch("/api/crm-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mob: formData.phone,
          email: formData.email,
          name: formData.name,
          project: ELDECO_CRM_PROJECT_NAME,
          remark: formData.message,
          ...tracking,
        }),
      }).then(async (response) => {
        if (response.ok) return;
        const result = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(result.error ?? "Could not submit to CRM. Please try again.");
      })
    : Promise.resolve();

  const sheetBody = new FormData();
  sheetBody.append("sheetName", ELDECO_GOOGLE_SHEET_NAME);
  sheetBody.append("Name", formData.name);
  sheetBody.append("Email", formData.email);
  sheetBody.append("Phone", formData.phone);
  sheetBody.append("Message", formData.message || "No Message");

  const sheetPromise = fetch(ELDECO_GOOGLE_SHEET_URL, {
    method: "POST",
    body: sheetBody,
    mode: "no-cors",
  }).catch(() => {
    throw new Error("Could not save your enquiry. Please try again.");
  });

  await Promise.all([crmPromise, sheetPromise]);
  return { ok: true };
}
