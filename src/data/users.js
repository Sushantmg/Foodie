export const defaultUsers = [
  {
    id: "1",
    email: "admin@foodiepos.com",
    password: "admin123",
    name: "Super Admin",
    role: "admin",
    avatar: "👨‍💼",
    phone: "+1 555-0100",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    email: "manager@foodiepos.com",
    password: "manager123",
    name: "John Manager",
    role: "manager",
    avatar: "👨‍🍳",
    phone: "+1 555-0200",
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    email: "staff@foodiepos.com",
    password: "staff123",
    name: "Jane Staff",
    role: "staff",
    avatar: "👩‍🍳",
    phone: "+1 555-0300",
    createdAt: "2024-02-01",
  },
];

export const roleLabels = {
  admin: "Administrator",
  manager: "Manager",
  staff: "Staff",
};

export const roleColors = {
  admin: "#ef4444",
  manager: "#f59e0b",
  staff: "#10b981",
};
