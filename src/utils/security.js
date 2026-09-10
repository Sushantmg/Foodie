import { storage } from "./helpers";

export const SECURITY = {
  maxAttempts: 5,
  lockoutMs: 30 * 60 * 1000,
  sessionTimeoutMs: 30 * 60 * 1000,
};

export function sha256(text) {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    return crypto.subtle
      .digest("SHA-256", new TextEncoder().encode(text))
      .then((buffer) =>
        Array.from(new Uint8Array(buffer))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
      );
  }
  return Promise.resolve(simpleHash(text));
}

function simpleHash(text) {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(16, "0");
}

export function generateSalt(length = 16) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function hashPassword(password, salt) {
  return sha256(`${salt}::${password}`);
}

export function isHashed(user) {
  return Boolean(user && user.passwordHash && user.salt);
}

export function safeCompare(a, b) {
  const x = String(a ?? "");
  const y = String(b ?? "");
  if (x.length !== y.length) return false;
  let diff = 0;
  for (let i = 0; i < x.length; i++) {
    diff |= x.charCodeAt(i) ^ y.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifyPassword(input, user) {
  if (isHashed(user)) {
    const hash = await hashPassword(input, user.salt);
    return safeCompare(hash, user.passwordHash);
  }
  return typeof user.password === "string" && safeCompare(input, user.password);
}

const KEY_ATTEMPTS = "loginAttempts";
const KEY_LOCK = "lockUntil";

export function getLoginAttempts() {
  return Number(storage.get(KEY_ATTEMPTS, 0));
}

export function getRemainingLockoutMs() {
  const until = Number(storage.get(KEY_LOCK, 0));
  return until > Date.now() ? until - Date.now() : 0;
}

export function recordFailedLogin() {
  const attempts = getLoginAttempts() + 1;
  if (attempts >= SECURITY.maxAttempts) {
    storage.set(KEY_LOCK, Date.now() + SECURITY.lockoutMs);
    storage.set(KEY_ATTEMPTS, 0);
    return { attempts, locked: true };
  }
  storage.set(KEY_ATTEMPTS, attempts);
  return { attempts, locked: false };
}

export function resetLoginAttempts() {
  storage.remove(KEY_ATTEMPTS);
  storage.remove(KEY_LOCK);
}