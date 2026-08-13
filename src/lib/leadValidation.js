/**
 * Shared enquiry / lead field validation for Contact Us, popups, Get in Touch, blog, chatbot.
 * Rejects clearly fake / test submissions (e.g. "Test User", test@gmail.com, 9876543210).
 */

const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Exact normalized names that are never real leads. */
const BLOCKED_NAMES = new Set([
  "test",
  "test user",
  "testuser",
  "testing",
  "tester",
  "dummy",
  "dummy user",
  "sample",
  "sample user",
  "demo",
  "demo user",
  "fake",
  "fake user",
  "asdf",
  "asdf asdf",
  "qwerty",
  "abc",
  "abc abc",
  "xxxx",
  "xxxxx",
  "user",
  "user name",
  "your name",
  "full name",
  "name",
  "n a",
  "na",
  "none",
  "null",
  "undefined",
  "john doe",
  "jane doe",
  "john smith",
  "foo bar",
]);

/** Local-part tokens that mark a disposable / test email. */
const BLOCKED_EMAIL_LOCALS = new Set([
  "test",
  "testing",
  "tester",
  "testuser",
  "dummy",
  "sample",
  "demo",
  "fake",
  "asdf",
  "qwerty",
  "abc",
  "noreply",
  "no-reply",
  "donotreply",
  "user",
  "username",
  "email",
  "mail",
  "admin",
  "xyz",
  "xxx",
]);

const BLOCKED_EMAIL_DOMAINS = new Set([
  "example.com",
  "example.org",
  "example.net",
  "test.com",
  "test.in",
  "mailinator.com",
  "guerrillamail.com",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "yopmail.com",
  "trashmail.com",
  "sharklasers.com",
]);

/** Common fake Indian mobiles (after normalizing to 10 digits). */
const BLOCKED_PHONES = new Set([
  "9876543210",
  "9876543211",
  "9123456789",
  "9988776655",
  "9000000000",
  "9999999999",
  "8888888888",
  "7777777777",
  "6666666666",
  "1234567890",
  "0123456789",
  "1111111111",
  "2222222222",
  "3333333333",
  "4444444444",
  "5555555555",
  "0000000000",
  "9898989898",
  "9090909090",
  "9812345678",
]);

function normalizeName(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function normalizeIndianPhone(phone) {
  let digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length >= 12) {
    digits = digits.slice(-10);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits;
}

function isSequentialDigits(digits) {
  if (digits.length !== 10) return false;
  let asc = true;
  let desc = true;
  for (let i = 1; i < digits.length; i += 1) {
    const prev = Number(digits[i - 1]);
    const curr = Number(digits[i]);
    if ((prev + 1) % 10 !== curr) asc = false;
    if ((prev + 9) % 10 !== curr) desc = false;
  }
  return asc || desc;
}

function hasTestToken(name) {
  const tokens = normalizeName(name).split(" ");
  const banned = new Set([
    "test",
    "testing",
    "tester",
    "dummy",
    "sample",
    "demo",
    "fake",
    "asdf",
    "qwerty",
    "xxx",
    "xxxx",
  ]);
  return tokens.some((t) => banned.has(t));
}

/**
 * @returns {string} error message, or "" if valid
 */
export function validateLeadName(name) {
  const trimmed = String(name || "").trim();
  if (!trimmed) return "Name is required";
  if (trimmed.length < 2) return "Name must be at least 2 characters";
  if (!NAME_REGEX.test(trimmed)) {
    return "Name can only contain letters, spaces, hyphens, and apostrophes";
  }
  const normalized = normalizeName(trimmed);
  if (BLOCKED_NAMES.has(normalized) || hasTestToken(trimmed)) {
    return "Please enter a valid name";
  }
  // Reject single repeated letter names like "aaaa"
  if (/^(.)\1+$/i.test(trimmed.replace(/\s/g, ""))) {
    return "Please enter a valid name";
  }
  return "";
}

/**
 * @returns {string} error message, or "" if valid
 */
export function validateLeadEmail(email) {
  const trimmed = String(email || "").trim().toLowerCase();
  if (!trimmed) return "Email is required";
  if (!EMAIL_REGEX.test(trimmed)) return "Please enter a valid email address";

  const [localRaw, domain] = trimmed.split("@");
  const local = (localRaw || "").split("+")[0];
  const localBase = local.replace(/[._-]/g, "");

  if (
    BLOCKED_EMAIL_LOCALS.has(local) ||
    BLOCKED_EMAIL_LOCALS.has(localBase) ||
    /^test(\d+)?$/.test(local) ||
    /^test(\d+)?$/.test(localBase) ||
    local.includes("dummy") ||
    local.includes("sample") ||
    local.includes("fakeuser") ||
    local === "fake"
  ) {
    return "Please enter a valid email address";
  }

  if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return "Please enter a valid email address";
  }

  return "";
}

/**
 * @returns {string} error message, or "" if valid
 */
export function validateLeadPhone(phone) {
  if (!String(phone || "").trim()) return "Phone number is required";

  const cleaned = normalizeIndianPhone(phone);
  if (!/^\d+$/.test(cleaned)) {
    return "Phone number can only contain digits, spaces, dashes, parentheses, or +91";
  }
  if (cleaned.length !== 10) {
    return "Phone number must be exactly 10 digits (after country code)";
  }
  if (!/^[6-9]/.test(cleaned)) {
    return "Phone number must start with 6, 7, 8, or 9";
  }
  if (/^(\d)\1{9}$/.test(cleaned)) {
    return "Please enter a valid phone number";
  }
  if (isSequentialDigits(cleaned) || BLOCKED_PHONES.has(cleaned)) {
    return "Please enter a valid phone number";
  }
  return "";
}

/**
 * Validate name / email / phone together.
 * @returns {{ name: string, email: string, phone: string, isValid: boolean }}
 */
export function validateLeadFields({ name, email, phone }) {
  const errors = {
    name: validateLeadName(name),
    email: validateLeadEmail(email),
    phone: validateLeadPhone(phone),
  };
  return {
    ...errors,
    isValid: !errors.name && !errors.email && !errors.phone,
  };
}
