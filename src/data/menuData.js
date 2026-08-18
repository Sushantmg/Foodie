export const menuData = [
  // Appetizers
  { id: 1, name: "Caesar Salad", category: "Appetizers", price: 8.99, cost: 2.50, image: "🥗", description: "Fresh romaine lettuce with parmesan and croutons", available: true, prepTime: 8, stock: 50 },
  { id: 2, name: "Bruschetta", category: "Appetizers", price: 7.49, cost: 1.80, image: "🍞", description: "Toasted bread topped with tomatoes and basil", available: true, prepTime: 6, stock: 40 },
  { id: 3, name: "Soup of the Day", category: "Appetizers", price: 6.99, cost: 1.50, image: "🍲", description: "Chef's special homemade soup", available: true, prepTime: 10, stock: 30 },
  { id: 4, name: "Buffalo Wings", category: "Appetizers", price: 10.99, cost: 3.20, image: "🍗", description: "Spicy chicken wings with ranch dip", available: true, prepTime: 15, stock: 35 },
  { id: 5, name: "Spring Rolls", category: "Appetizers", price: 8.49, cost: 2.00, image: "🥟", description: "Crispy vegetable spring rolls with sweet chili", available: true, prepTime: 12, stock: 45 },
  // Main Course
  { id: 6, name: "Grilled Salmon", category: "Main Course", price: 18.99, cost: 7.50, image: "🐟", description: "Atlantic salmon with lemon butter sauce", available: true, prepTime: 20, stock: 25 },
  { id: 7, name: "Ribeye Steak", category: "Main Course", price: 24.99, cost: 10.00, image: "🥩", description: "12oz premium cut with garlic mashed potatoes", available: true, prepTime: 25, stock: 20 },
  { id: 8, name: "Chicken Alfredo", category: "Main Course", price: 14.99, cost: 4.50, image: "🍝", description: "Creamy pasta with grilled chicken breast", available: true, prepTime: 18, stock: 30 },
  { id: 9, name: "Veggie Burger", category: "Main Course", price: 12.99, cost: 3.80, image: "🍔", description: "Plant-based patty with avocado and sprouts", available: true, prepTime: 12, stock: 35 },
  { id: 10, name: "BBQ Ribs", category: "Main Course", price: 22.99, cost: 9.00, image: "🍖", description: "Slow-cooked pork ribs with BBQ glaze", available: true, prepTime: 30, stock: 15 },
  { id: 11, name: "Mushroom Risotto", category: "Main Course", price: 16.99, cost: 4.00, image: "🍄", description: "Creamy arborio rice with wild mushrooms", available: true, prepTime: 22, stock: 25 },
  { id: 12, name: "Fish & Chips", category: "Main Course", price: 13.99, cost: 4.20, image: "🐟", description: "Beer-battered cod with crispy fries", available: true, prepTime: 15, stock: 30 },
  // Desserts
  { id: 13, name: "Tiramisu", category: "Desserts", price: 8.99, cost: 2.80, image: "🍰", description: "Classic Italian coffee-flavored dessert", available: true, prepTime: 5, stock: 20 },
  { id: 14, name: "Chocolate Lava Cake", category: "Desserts", price: 9.99, cost: 3.00, image: "🍫", description: "Warm chocolate cake with molten center", available: true, prepTime: 15, stock: 20 },
  { id: 15, name: "Cheesecake", category: "Desserts", price: 7.99, cost: 2.50, image: "🧁", description: "New York style with berry compote", available: true, prepTime: 5, stock: 25 },
  { id: 16, name: "Ice Cream Sundae", category: "Desserts", price: 6.49, cost: 1.50, image: "🍨", description: "Three scoops with toppings and whipped cream", available: true, prepTime: 3, stock: 40 },
  // Beverages
  { id: 17, name: "Coca-Cola", category: "Beverages", price: 2.99, cost: 0.50, image: "🥤", description: "Classic cola drink", available: true, prepTime: 1, stock: 100 },
  { id: 18, name: "Fresh Lemonade", category: "Beverages", price: 3.99, cost: 0.80, image: "🍋", description: "Freshly squeezed lemonade", available: true, prepTime: 3, stock: 60 },
  { id: 19, name: "Espresso", category: "Beverages", price: 3.49, cost: 0.60, image: "☕", description: "Double shot espresso", available: true, prepTime: 2, stock: 80 },
  { id: 20, name: "Iced Tea", category: "Beverages", price: 2.99, cost: 0.40, image: "🧊", description: "Fresh brewed iced tea", available: true, prepTime: 2, stock: 70 },
  { id: 21, name: "Red Wine", category: "Beverages", price: 8.99, cost: 3.00, image: "🍷", description: "Glass of house red wine", available: true, prepTime: 1, stock: 30 },
  { id: 22, name: "Sparkling Water", category: "Beverages", price: 1.99, cost: 0.30, image: "💧", description: "Chilled sparkling mineral water", available: true, prepTime: 1, stock: 90 },
  { id: 23, name: "Mango Smoothie", category: "Beverages", price: 5.49, cost: 1.50, image: "🥭", description: "Fresh mango blended with yogurt", available: true, prepTime: 5, stock: 40 },
  { id: 24, name: "Hot Chocolate", category: "Beverages", price: 3.99, cost: 0.70, image: "☕", description: "Rich cocoa with whipped cream", available: true, prepTime: 3, stock: 50 },
];

export const categories = ["All", "Appetizers", "Main Course", "Desserts", "Beverages"];

export const modifiers = [
  { id: "m1", name: "Extra Cheese", price: 1.50 },
  { id: "m2", name: "Spicy", price: 0.00 },
  { id: "m3", name: "No Onions", price: 0.00 },
  { id: "m4", name: "Extra Sauce", price: 0.75 },
  { id: "m5", name: "Gluten-Free", price: 2.00 },
];
