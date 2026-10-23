import { describe, it, expect, beforeEach } from "vitest";
import { storage } from "./helpers";
import {
  SECURITY,
  generateSalt,
  hashPassword,
  verifyPassword,
  safeCompare,
  getRemainingLockoutMs,
  recordFailedLogin,
  resetLoginAttempts,
} from "./security";

beforeEach(() => {
  storage.clear();
});

describe("passwords", () => {
  it("generates unique hex salts", () => {
    const a = generateSalt();
    const b = generateSalt();
    expect(a).toMatch(/^[0-9a-f]{32}$/);
    expect(a).not.toBe(b);
  });

  it("hashes deterministically per salt", async () => {
    const salt = generateSalt();
    const first = await hashPassword("secret", salt);
    const second = await hashPassword("secret", salt);
    const otherSalt = await hashPassword("secret", generateSalt());

    expect(first).toBe(second);
    expect(first).not.toBe(otherSalt);
  });

  it("verifies hashed users", async () => {
    const salt = generateSalt();
    const user = { salt, passwordHash: await hashPassword("secret", salt) };

    await expect(verifyPassword("secret", user)).resolves.toBe(true);
    await expect(verifyPassword("wrong", user)).resolves.toBe(false);
  });

  it("still verifies legacy plaintext users", async () => {
    await expect(verifyPassword("secret", { password: "secret" })).resolves.toBe(true);
    await expect(verifyPassword("wrong", { password: "secret" })).resolves.toBe(false);
  });

  it("compares strings safely", () => {
    expect(safeCompare("abc", "abc")).toBe(true);
    expect(safeCompare("abc", "abd")).toBe(false);
    expect(safeCompare("abc", "abcd")).toBe(false);
    expect(safeCompare(null, "")).toBe(false);
  });
});

describe("login lockout", () => {
  it("locks the account after the maximum number of attempts", () => {
    for (let i = 1; i < SECURITY.maxAttempts; i++) {
      expect(recordFailedLogin()).toEqual({ attempts: i, locked: false });
      expect(getRemainingLockoutMs()).toBe(0);
    }

    expect(recordFailedLogin()).toEqual({ attempts: SECURITY.maxAttempts, locked: true });
    expect(getRemainingLockoutMs()).toBeGreaterThan(0);
  });

  it("clears attempts and lockout on reset", () => {
    for (let i = 0; i < SECURITY.maxAttempts; i++) recordFailedLogin();
    resetLoginAttempts();

    expect(getRemainingLockoutMs()).toBe(0);
    expect(recordFailedLogin()).toEqual({ attempts: 1, locked: false });
  });
});
