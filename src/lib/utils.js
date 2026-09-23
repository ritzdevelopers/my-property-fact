import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now - then) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

export function truncate(str, length) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export function formatDistanceKm(value) {
  if (value === undefined || value === null) return "";
  const text = String(value).trim();
  if (!text) return "";
  return /km/i.test(text) ? text : `${text} Km`;
}

export function normalizeDistanceKm(value) {
  if (value === undefined || value === null) return "";
  const text = String(value).trim();
  if (!text) return "";
  const numericPart = text.replace(/\s*km\s*$/i, "").trim();
  return numericPart ? `${numericPart} Km` : "";
}

export const PARKING_OPTIONS = [
  "No Parking",
  "1 Covered",
  "1 Open",
  "2 Covered",
  "2 Open",
  "Multiple",
];

export function parseParkingValue(value) {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) {
    return value.filter((item) => PARKING_OPTIONS.includes(item));
  }
  const text = String(value).trim();
  if (!text) return [];
  if (PARKING_OPTIONS.includes(text)) return [text];
  return text
    .split(/\s*\+\s*/)
    .map((part) => part.trim())
    .filter((part) => PARKING_OPTIONS.includes(part));
}

export function formatParkingValue(selections) {
  const selected = parseParkingValue(selections);
  if (selected.length === 0) return "";
  return PARKING_OPTIONS.filter((option) => selected.includes(option)).join(
    " + ",
  );
}

export function extractParkingSlots(value) {
  const formatted = formatParkingValue(value);
  if (!formatted) return null;
  if (formatted.includes("No Parking")) return 0;
  const nums = formatted.match(/\d+/g);
  if (!nums || nums.length === 0) return null;
  return nums.reduce((sum, num) => sum + parseInt(num, 10), 0);
}

export function formatAgeOfConstruction(value) {
  if (value == null || value === "") return null;
  const text = String(value).trim();
  if (!text) return null;
  return `${text} Year Old`;
}

export function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
