const STORAGE_PREFIX = "foodiepos_";

// Bump when the persisted shape changes so old backups can be migrated/rejected.
export const STORAGE_SCHEMA_VERSION = 1;
const SCHEMA_KEY = "__schema";

const isArray = Array.isArray;
const isPlainObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

// Settings must at least carry the fields the app reads, otherwise a `{}` restore
// would silently render every price as NaN.
const isSettings = (v) =>
  isPlainObject(v) &&
  typeof v.restaurantName === "string" &&
  typeof v.taxRate === "number" &&
  typeof v.serviceCharge === "number" &&
  typeof v.currency === "string" &&
  isPlainObject(v.openingHours);

// Shape each persisted key must have before a backup is allowed to overwrite it.
const STORAGE_SHAPES = {
  users: isArray,
  menu: isArray,
  orders: isArray,
  customers: isArray,
  expenses: isArray,
  tables: isArray,
  settings: isSettings,
  currentUser: (v) => v === null || isPlainObject(v),
  darkMode: (v) => typeof v === "boolean",
};

export const storage = {
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },

  remove(key) {
    localStorage.removeItem(STORAGE_PREFIX + key);
  },

  exportAll() {
    const data = { [SCHEMA_KEY]: STORAGE_SCHEMA_VERSION };
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => {
        const key = k.slice(STORAGE_PREFIX.length);
        try {
          data[key] = JSON.parse(localStorage.getItem(k));
        } catch {
          data[key] = localStorage.getItem(k);
        }
      });
    return data;
  },

  importAll(data) {
    if (!isPlainObject(data)) return false;

    const { [SCHEMA_KEY]: schema, ...payload } = data;

    // Backups from an unknown/newer schema cannot be trusted.
    if (schema !== undefined) {
      if (!Number.isInteger(schema) || schema < 1) return false;
      if (schema > STORAGE_SCHEMA_VERSION) return false;
    }

    const known = Object.keys(STORAGE_SHAPES);
    const entries = Object.entries(payload).filter(([key]) => known.includes(key));
    if (entries.length === 0) return false;

    // Validate everything before writing so a bad file cannot partially restore.
    const invalid = entries.some(([key, value]) => !STORAGE_SHAPES[key](value));
    if (invalid) return false;

    entries.forEach(([key, value]) => this.set(key, value));
    this.set(SCHEMA_KEY, STORAGE_SCHEMA_VERSION);
    return true;
  },

  clear() {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(STORAGE_PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  },
};

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

let activeCurrencySymbol = "$";

export function setCurrencySymbol(symbol) {
  activeCurrencySymbol = symbol || "$";
}

export function formatCurrency(amount, symbol = activeCurrencySymbol) {
  return `${symbol}${Number(amount).toFixed(2)}`;
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getToday() {
  return new Date().toISOString().split("T")[0];
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
