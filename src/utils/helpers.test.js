import { describe, it, expect, beforeEach } from "vitest";
import { storage, STORAGE_SCHEMA_VERSION, formatCurrency, setCurrencySymbol } from "./helpers";

const validBackup = () => ({
  __schema: STORAGE_SCHEMA_VERSION,
  orders: [{ id: "o1", total: 10 }],
  settings: {
    restaurantName: "Test Kitchen",
    taxRate: 10,
    serviceCharge: 0,
    currency: "$",
    openingHours: {},
  },
  darkMode: true,
});

beforeEach(() => storage.clear());

describe("storage", () => {
  it("round-trips persisted data through export/import", () => {
    storage.set("orders", [{ id: "o1" }]);
    storage.set("darkMode", true);

    const backup = storage.exportAll();
    expect(backup.__schema).toBe(STORAGE_SCHEMA_VERSION);

    storage.clear();
    expect(storage.get("orders")).toBeNull();

    expect(storage.importAll(backup)).toBe(true);
    expect(storage.get("orders")).toEqual([{ id: "o1" }]);
    expect(storage.get("darkMode")).toBe(true);
  });

  it("rejects values that are not objects", () => {
    expect(storage.importAll(null)).toBe(false);
    expect(storage.importAll(undefined)).toBe(false);
    expect(storage.importAll("backup")).toBe(false);
    expect(storage.importAll([])).toBe(false);
  });

  it("rejects a backup that contains no known keys", () => {
    expect(storage.importAll({ somethingElse: true })).toBe(false);
  });

  it("rejects a backup with the wrong shape", () => {
    expect(storage.importAll({ ...validBackup(), orders: "not-an-array" })).toBe(false);
    expect(storage.importAll({ ...validBackup(), settings: "not-an-object" })).toBe(false);
    expect(storage.importAll({ ...validBackup(), settings: {} })).toBe(false);
    expect(storage.importAll({ ...validBackup(), darkMode: "yes" })).toBe(false);
  });

  it("rejects backups from a newer schema", () => {
    expect(storage.importAll({ ...validBackup(), __schema: STORAGE_SCHEMA_VERSION + 1 })).toBe(false);
  });

  it("accepts legacy backups without a schema marker", () => {
    const { __schema, ...legacy } = validBackup();
    expect(storage.importAll(legacy)).toBe(true);
  });

  it("does not partially write when one key is invalid", () => {
    storage.importAll({
      ...validBackup(),
      orders: [{ id: "should-not-land" }],
      settings: "broken",
    });
    expect(storage.get("orders")).toBeNull();
  });

  it("ignores unknown keys while restoring known ones", () => {
    const backup = validBackup();
    expect(storage.importAll({ ...backup, legacyThing: { a: 1 } })).toBe(true);
    expect(storage.get("legacyThing")).toBeNull();
    expect(storage.get("settings")).toEqual(backup.settings);
  });
});

describe("formatCurrency", () => {
  it("formats using the active currency symbol", () => {
    setCurrencySymbol("$");
    expect(formatCurrency(12.5)).toBe("$12.50");

    setCurrencySymbol("Rs ");
    expect(formatCurrency(12.5)).toBe("Rs 12.50");

    setCurrencySymbol("$"); // reset for other tests
  });
});
