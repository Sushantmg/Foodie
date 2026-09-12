const day = (offset) =>
  new Date(Date.now() - offset * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

export const expenseCategories = [
  "Ingredients",
  "Beverages",
  "Utilities",
  "Rent",
  "Wages",
  "Marketing",
  "Equipment",
  "Maintenance",
  "Other",
];

export const categoryColors = {
  Ingredients: "#10b981",
  Beverages: "#3b82f6",
  Utilities: "#f59e0b",
  Rent: "#8b5cf6",
  Wages: "#ef4444",
  Marketing: "#ec4899",
  Equipment: "#14b8a6",
  Maintenance: "#f97316",
  Other: "#64748b",
};

export const defaultExpenses = [
  { id: "e1", category: "Ingredients", description: "Weekly vegetable supply", amount: 85.5, date: day(0), addedBy: "Super Admin" },
  { id: "e2", category: "Beverages", description: "Soft drinks restock", amount: 42.0, date: day(0), addedBy: "John Manager" },
  { id: "e3", category: "Wages", description: "Part-time server wages", amount: 120.0, date: day(1), addedBy: "Super Admin" },
  { id: "e4", category: "Utilities", description: "Monthly electricity bill", amount: 95.0, date: day(4), addedBy: "Super Admin" },
  { id: "e5", category: "Marketing", description: "Social media ads", amount: 30.0, date: day(6), addedBy: "John Manager" },
];