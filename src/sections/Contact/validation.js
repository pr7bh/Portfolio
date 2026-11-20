/* Contact-form validation. Each validator returns
   { error }                     — the value can't be sent, or
   { value, display?, hint? }    — the cleaned value to send, an optional
                                    prettier form for the input, and an
                                    optional non-blocking suggestion. */

// ── Email ──────────────────────────────────────────────────────────

const COMMON_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "yahoo.co.in",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "icloud.com",
  "protonmail.com",
  "proton.me",
  "rediffmail.com",
  "aol.com",
];

function editDistance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return row[b.length];
}

// "gmial.com" → "gmail.com", "gmail.con" → "gmail.com"
function suggestDomain(domain) {
  if (COMMON_DOMAINS.includes(domain)) return null;
  let best = null;
  let bestDistance = 3;
  for (const known of COMMON_DOMAINS) {
    const d = editDistance(domain, known);
    if (d < bestDistance) {
      best = known;
      bestDistance = d;
    }
  }
  return best;
}

const LOCAL_RE = /^[A-Za-z0-9._%+'-]+$/;
const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;

export function validateEmail(input) {
  const email = input.trim();
  if (!email) return { error: "Email is required." };
  if (/\s/.test(email)) return { error: "Email can't contain spaces." };
  if (email.length > 254) return { error: "That email is too long." };

  const at = email.lastIndexOf("@");
  if (at < 1 || email.indexOf("@") !== at || at === email.length - 1) {
    return { error: "Enter a valid email, like name@example.com." };
  }

  const local = email.slice(0, at);
  const domain = email.slice(at + 1).toLowerCase();

  if (
    local.length > 64 ||
    !LOCAL_RE.test(local) ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..")
  ) {
    return { error: "The part before “@” doesn't look right." };
  }
  if (!DOMAIN_RE.test(domain)) {
    return { error: "Check the domain after “@”, e.g. gmail.com." };
  }

  const value = `${local}@${domain}`;
  const suggestion = suggestDomain(domain);
  return {
    value,
    hint: suggestion ? { text: `Did you mean ${local}@${suggestion}?`, apply: `${local}@${suggestion}` } : null,
  };
}

// ── Phone ──────────────────────────────────────────────────────────

const isJunk = (digits) =>
  /^(\d)\1+$/.test(digits) || "01234567890".includes(digits) || "98765432109".includes(digits);

function formatIndian(n) {
  return `+91 ${n.slice(0, 5)} ${n.slice(5)}`;
}

function formatNANP(n) {
  return `+1 ${n.slice(0, 3)} ${n.slice(3, 6)} ${n.slice(6)}`;
}

/* Accepts "+91 98765 43210", "098765 43210", "9876543210", "0044 20 …",
   "+1 (415) 555-0132" and similar. Numbers without a country code are
   treated as Indian. Returns the number in E.164 (+919876543210). */
export function validatePhone(input) {
  const raw = input.trim();
  if (!raw) return { error: "Contact number is required." };
  if (/[^\d\s().+-]/.test(raw)) {
    return { error: "Use digits only — spaces, dashes and a leading + are fine." };
  }
  const plusCount = (raw.match(/\+/g) || []).length;
  if (plusCount > 1 || (plusCount === 1 && !raw.startsWith("+"))) {
    return { error: "“+” can only appear once, at the start." };
  }

  let digits = raw.replace(/\D/g, "");
  let international = raw.startsWith("+");
  if (!international && digits.startsWith("00")) {
    digits = digits.slice(2);
    international = true;
  }

  if (!international) {
    if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
    else if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
    if (digits.length !== 10) {
      return { error: "Enter a 10-digit mobile number, or add your country code (e.g. +44)." };
    }
    digits = `91${digits}`;
  }

  if (digits.startsWith("0")) return { error: "Country codes don't start with 0." };

  if (digits.startsWith("91")) {
    const n = digits.slice(2);
    if (n.length !== 10) return { error: "Indian numbers have 10 digits after +91." };
    if (!/^[6-9]/.test(n)) return { error: "Indian mobile numbers start with 6, 7, 8 or 9." };
    if (isJunk(n)) return { error: "That doesn't look like a real number." };
    return { value: `+${digits}`, display: formatIndian(n) };
  }

  if (digits.startsWith("1")) {
    const n = digits.slice(1);
    if (n.length !== 10 || !/^[2-9]\d{2}[2-9]/.test(n)) {
      return { error: "US/Canada numbers are +1 followed by 10 digits." };
    }
    if (isJunk(n)) return { error: "That doesn't look like a real number." };
    return { value: `+${digits}`, display: formatNANP(n) };
  }

  // Any other country: E.164 allows 8–15 digits including the country code.
  if (digits.length < 8 || digits.length > 15) {
    return { error: "That number is too short or too long for an international number." };
  }
  if (/(\d)\1{6,}/.test(digits)) return { error: "That doesn't look like a real number." };
  return { value: `+${digits}` };
}

// ── Name & message ─────────────────────────────────────────────────

export function validateName(input) {
  const name = input.trim().replace(/\s+/g, " ");
  if (!name) return { error: "Please tell me your name." };
  if (name.length < 2) return { error: "Name needs at least 2 characters." };
  if (name.length > 80) return { error: "Name must be 80 characters or fewer." };
  if (!/^[\p{L}\p{M}][\p{L}\p{M} .'-]*$/u.test(name)) {
    return { error: "Use letters only (spaces, . ' and - are fine)." };
  }
  return { value: name };
}

export const MESSAGE_MAX = 2000;

export function validateMessage(input) {
  const message = input.trim();
  if (!message) return { error: "Please write a message." };
  if (message.length < 10) return { error: `A little more detail, please — at least 10 characters (${message.length}/10).` };
  if (message.length > MESSAGE_MAX) return { error: `Keep it under ${MESSAGE_MAX} characters.` };
  return { value: message };
}

export const VALIDATORS = {
  name: validateName,
  email: validateEmail,
  phone: validatePhone,
  message: validateMessage,
};
