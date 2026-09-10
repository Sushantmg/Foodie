export const defaultUsers = [
  {
    id: "1",
    email: "admin@foodiepos.com",
    salt: "8f3a2c9d1e4b5a6f",
    passwordHash: "303e300f63f6a718a6be77007b89cedde6f89c23e1f11bc69c27ce5748028bca",
    name: "Super Admin",
    role: "admin",
    avatar: "👨‍💼",
    phone: "+1 555-0100",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    email: "manager@foodiepos.com",
    salt: "0c5e9f2a7b3d4e8c",
    passwordHash: "63e0b4d653fb436bba729b71ce614536a193150a8cb965efc1a32fa0521de426",
    name: "John Manager",
    role: "manager",
    avatar: "👨‍🍳",
    phone: "+1 555-0200",
    createdAt: "2024-01-15",
  },
  {
    id: "3",
    email: "staff@foodiepos.com",
    salt: "6d2a4c8e1b9f3e5a",
    passwordHash: "e65612f0c48b0aeeb17695bf0da263ab6742e36bfe21ab666675951118fe8808",
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