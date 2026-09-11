const STORAGE_PREFIX = "foodiepos_";

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
    const data = {};
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
    if (!data || typeof data !== "object") return false;
    Object.entries(data).forEach(([key, value]) => this.set(key, value));
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
