export const defaultCustomers = [
  { id: "c1", name: "Alice Johnson", phone: "+1 555-1001", email: "alice@email.com", loyaltyPoints: 450, totalSpent: 890.50, visits: 12, createdAt: "2024-01-10", tier: "gold" },
  { id: "c2", name: "Bob Smith", phone: "+1 555-1002", email: "bob@email.com", loyaltyPoints: 200, totalSpent: 420.00, visits: 6, createdAt: "2024-02-15", tier: "silver" },
  { id: "c3", name: "Carol Williams", phone: "+1 555-1003", email: "carol@email.com", loyaltyPoints: 1200, totalSpent: 2100.75, visits: 28, createdAt: "2024-01-05", tier: "platinum" },
  { id: "c4", name: "David Brown", phone: "+1 555-1004", email: "david@email.com", loyaltyPoints: 75, totalSpent: 150.00, visits: 3, createdAt: "2024-06-01", tier: "bronze" },
  { id: "c5", name: "Eva Martinez", phone: "+1 555-1005", email: "eva@email.com", loyaltyPoints: 600, totalSpent: 1200.00, visits: 18, createdAt: "2024-03-20", tier: "gold" },
];

export const loyaltyTiers = {
  bronze: { name: "Bronze", minPoints: 0, discount: 0, color: "#cd7f32" },
  silver: { name: "Silver", minPoints: 100, discount: 5, color: "#c0c0c0" },
  gold: { name: "Gold", minPoints: 300, discount: 10, color: "#ffd700" },
  platinum: { name: "Platinum", minPoints: 1000, discount: 15, color: "#e5e4e2" },
};
