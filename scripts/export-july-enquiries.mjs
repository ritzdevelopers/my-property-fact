/**
 * Export MPF enquiries for a given month to Excel.
 *
 * Usage:
 *   node scripts/export-july-enquiries.mjs
 *   node scripts/export-july-enquiries.mjs --year 2026 --month 7
 *
 * Env (optional):
 *   MPF_API_URL          default: https://apis.mypropertyfact.in/api/v1/
 *   MPF_CRM_WEBHOOK_KEY  CRM export key (x-mpf-crm-key header)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs() {
  const args = process.argv.slice(2);
  let year = new Date().getFullYear();
  let month = new Date().getMonth() + 1;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--year" && args[i + 1]) year = Number(args[++i]);
    if (args[i] === "--month" && args[i + 1]) month = Number(args[++i]);
  }

  return { year, month };
}

function readKeyFromBackendProps() {
  const propsPath = path.resolve(
    __dirname,
    "../../mpf-backend/src/main/resources/application-dev.properties",
  );
  if (!fs.existsSync(propsPath)) return "";
  const text = fs.readFileSync(propsPath, "utf8");
  const match = text.match(/^crm\.webhook\.key=(.+)$/m);
  return match ? match[1].trim() : "";
}

function parseEnquiryDate(row) {
  const raw = row.createdAt ?? row.updatedAt ?? row.date;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

function enquirySource(row) {
  const from = String(row.enquiryFrom || "").trim().toUpperCase();
  return from === "APP" ? "App" : "Website";
}

function formatDate(row) {
  const d = parseEnquiryDate(row);
  if (!d) return "";
  return d.toLocaleString("en-IN", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function monthLabel(year, month) {
  return new Date(year, month - 1, 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
}

async function main() {
  const { year, month } = parseArgs();
  const apiBase =
    process.env.MPF_API_URL || "https://apis.mypropertyfact.in/api/v1/";
  const crmKey =
    process.env.MPF_CRM_WEBHOOK_KEY || readKeyFromBackendProps();

  if (!crmKey) {
    console.error(
      "Missing MPF_CRM_WEBHOOK_KEY. Set env var or crm.webhook.key in application-dev.properties.",
    );
    process.exit(1);
  }

  const exportUrl = `${apiBase.replace(/\/?$/, "/")}enquiry/crm-export`;
  console.log(`Fetching enquiries from ${exportUrl} ...`);

  const res = await fetch(exportUrl, {
    headers: {
      "x-mpf-crm-key": crmKey,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Export failed (${res.status}): ${body.slice(0, 300)}`);
    process.exit(1);
  }

  const all = await res.json();
  if (!Array.isArray(all)) {
    console.error("Unexpected API response (expected array).");
    process.exit(1);
  }

  const filtered = all
    .filter((row) => {
      const d = parseEnquiryDate(row);
      return d && d.getFullYear() === year && d.getMonth() + 1 === month;
    })
    .sort((a, b) => parseEnquiryDate(b) - parseEnquiryDate(a));

  console.log(
    `Total enquiries: ${all.length} | ${monthLabel(year, month)}: ${filtered.length}`,
  );

  if (filtered.length === 0) {
    console.warn("No enquiries found for the selected month.");
    process.exit(0);
  }

  const rows = filtered.map((row, i) => ({
    "#": i + 1,
    Name: row.name ?? "",
    Email: row.email ?? "",
    Phone: row.phone ?? "",
    Message: row.message ?? "",
    Source: enquirySource(row),
    "Project Link": row.projectLink ?? "",
    "Page Name": row.pageName ?? "",
    Status: row.status ?? "New",
    Date: formatDate(row),
    "Property ID": row.propertyId ?? "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Enquiries");

  const monthName = new Date(year, month - 1, 1)
    .toLocaleString("en-US", { month: "short" })
    .toLowerCase();
  const outDir = path.resolve(__dirname, "../exports");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(
    outDir,
    `mpf-enquiries-${monthName}-${year}.xlsx`,
  );

  XLSX.writeFile(wb, outFile);
  console.log(`Saved: ${outFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
