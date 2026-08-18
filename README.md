<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"/>
</p>

<h1 align="center">🍽️ FoodiePOS</h1>

<p align="center">
  <strong>A complete, production-ready Restaurant Point of Sale System with AI Chatbot</strong>
</p>

<p align="center">
  Built for real-world restaurant operations — featuring authentication, role-based access, inventory management, staff management, customer loyalty, analytics dashboard, and an intelligent chatbot assistant.
</p>

---

## 🚀 Features Overview

### 🔐 Authentication & Role-Based Access
| Role | Permissions |
|------|------------|
| **Admin** | Full access — POS, Orders, Dashboard, Reports, Menu, Inventory, Staff, Customers, Settings |
| **Manager** | POS, Orders, Dashboard, Reports, Menu, Inventory, Staff, Customers |
| **Staff** | POS, Orders, Tables, Chatbot only |

### 🛒 POS Terminal
- **24 menu items** across 4 categories with search & filter
- **Cart management** — add, remove, quantity controls
- **Item modifiers** — Extra Cheese, Spicy, Gluten-Free, etc.
- **Order types** — Dine-In (table selection), Takeaway, Delivery
- **Discounts** — Fixed amount or percentage
- **Customer linking** — Assign orders to loyalty members
- **Multi-payment** — Cash, Card, UPI
- **Tax calculation** — Configurable tax rate
- **Auto stock deduction** on order placement

### 📋 Order Management
- Real-time status tracking: **Preparing → Ready → Completed**
- Cancel orders
- View order details (items, total, time, staff)
- Table auto-release on completion

### 🪑 Table Management
- Visual table layout (20 tables)
- Color-coded status (Available / Occupied)
- Click to assign to table
- Quick navigation to active orders

### 📊 Dashboard
- Revenue, Profit, Orders, Avg Order Value
- Hourly sales bar chart
- Popular items ranking
- Category sales breakdown
- Low stock alerts
- Recent orders feed

### 📈 Reports & Analytics
- Filter by: Today / This Week / This Month / All Time
- Revenue, Profit, Tax collected
- Top selling items with profit per item
- Payment method breakdown
- Order type distribution
- Hourly sales distribution
- **CSV Export** for all reports

### 📝 Menu Management
- Add / Edit / Delete menu items
- Set prices, costs, stock levels, prep time
- Toggle availability
- Category filtering
- Emoji icon picker

### 📦 Inventory Management
- Track stock levels across all items
- Low stock & out-of-stock alerts
- Restock with one click (+50 units)
- Sort by name, stock, or value
- Filter by stock status

### 👥 Staff Management
- Add / Edit / Remove team members
- Assign roles (Admin, Manager, Staff)
- Avatar selection
- Contact info & join date

### 💎 Customer & Loyalty System
- Customer database with contact info
- Loyalty tiers: **Bronze → Silver → Gold → Platinum**
- Points earned per dollar spent
- Tier-based discounts (5% – 15%)
- Visit & spending tracking

### 💬 AI Chatbot
- Answers questions about menu, hours, specials, allergens, reservations
- **Real-time stats** — today's orders, revenue
- **Order status** checking
- **Loyalty program** info
- Quick action buttons
- Natural language understanding

### ⚙️ Settings
- Restaurant profile (name, address, contact)
- Tax rate & service charge configuration
- Low stock threshold
- Loyalty program toggle & points config
- Receipt header/footer messages
- Opening hours per day of week

### 🌙 Dark Mode
- Toggle between light and dark themes

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **Vite** | Build Tool & Dev Server |
| **Context API + useReducer** | State Management |
| **localStorage** | Data Persistence |
| **CSS3** | Styling (No external UI library) |

---

## 📦 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- npm or yarn

### Installation

```bash
# Clone the repo
git clone git@github.com:Sushantmg/Foodie.git

# Install dependencies
cd Foodie
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 👨‍💼 Admin | admin@foodiepos.com | admin123 |
| 👨‍🍳 Manager | manager@foodiepos.com | manager123 |
| 👩‍🍳 Staff | staff@foodiepos.com | staff123 |

---

## 📁 Project Structure

```
Foodie/
├── src/
│   ├── components/
│   │   └── shared/
│   │       ├── Sidebar.jsx / Sidebar.css
│   │       ├── TopBar.jsx / TopBar.css
│   │       ├── Modal.jsx / Modal.css
│   │       └── Notification.jsx / Notification.css
│   ├── context/
│   │   └── AppContext.jsx          # Global state management
│   ├── data/
│   │   ├── menuData.js             # Menu items, categories, modifiers
│   │   ├── users.js                # Default user accounts & roles
│   │   ├── customers.js            # Customer database & loyalty tiers
│   │   └── settings.js             # Default restaurant settings
│   ├── pages/
│   │   ├── Login.jsx / Login.css
│   │   ├── POS.jsx / POS.css
│   │   ├── Orders.jsx / Orders.css
│   │   ├── Tables.jsx / Tables.css
│   │   ├── Dashboard.jsx / Dashboard.css
│   │   ├── Reports.jsx / Reports.css
│   │   ├── MenuMgmt.jsx / MenuMgmt.css
│   │   ├── Inventory.jsx / Inventory.css
│   │   ├── Staff.jsx / Staff.css
│   │   ├── Customers.jsx / Customers.css
│   │   ├── Chatbot.jsx / Chatbot.css
│   │   └── Settings.jsx / Settings.css
│   ├── utils/
│   │   └── helpers.js              # Utility functions
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## 📸 Screenshots

| Login | POS Terminal | Orders | Dashboard |
|-------|-------------|--------|-----------|
| 🔐 Secure auth with role selection | 🛒 Full ordering with modifiers | 📋 Real-time order tracking | 📊 Analytics & insights |

| Inventory | Staff | Customers | Reports |
|-----------|-------|-----------|---------|
| 📦 Stock tracking & alerts | 👥 Team management | 💎 Loyalty tiers | 📈 Detailed analytics |

---

## 🔧 Configuration

All settings are configurable through the **Settings** page:

- **Tax Rate**: Default 8%
- **Low Stock Threshold**: Default 10 units
- **Loyalty Points**: 1 point per dollar
- **Opening Hours**: Per day configuration
- **Receipt**: Custom header/footer messages

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ for restaurant owners who want a modern, business-ready POS experience
</p>
