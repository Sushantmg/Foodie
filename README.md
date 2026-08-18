<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License"/>
  <img src="https://img.shields.io/badge/Version-2.0-blueviolet?style=for-the-badge" alt="Version"/>
</p>

<h1 align="center">🍽️ FoodiePOS</h1>

<p align="center">
  <strong>A complete, production-ready Restaurant Point of Sale System with AI Chatbot</strong>
</p>

<p align="center">
  Built for real-world restaurant operations — featuring authentication, role-based access, inventory management, staff management, customer loyalty, analytics dashboard, and an intelligent chatbot assistant.
</p>

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FoodiePOS System                           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │   Frontend   │◄──►│  App Context │◄──►│  localStorage│          │
│  │   (React)    │    │  (State)     │    │  (Storage)   │          │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘          │
│         │                   │                                       │
│         ▼                   ▼                                       │
│  ┌──────────────┐    ┌──────────────┐                               │
│  │   Pages      │    │  Reducer     │                               │
│  │  ┌────────┐  │    │  ┌────────┐  │                               │
│  │  │  POS   │  │    │  │Actions │  │                               │
│  │  ├────────┤  │    │  ├────────┤  │                               │
│  │  │ Orders │  │    │  │ State  │  │                               │
│  │  ├────────┤  │    │  ├────────┤  │                               │
│  │  │Dashboard│ │    │  │Dispatch│  │                               │
│  │  ├────────┤  │    │  └────────┘  │                               │
│  │  │ Reports│  │    └──────────────┘                               │
│  │  ├────────┤                                                      │
│  │  │ Staff  │                                                      │
│  │  ├────────┤                                                      │
│  │  │Inventory│                                                     │
│  │  ├────────┤                                                      │
│  │  │Customers│                                                     │
│  │  ├────────┤                                                      │
│  │  │Settings│                                                      │
│  │  ├────────┤                                                      │
│  │  │Chatbot │                                                      │
│  │  └────────┘                                                      │
│  └──────────────┘                                                   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Core Workflows

### 1. Authentication & Login Flow

```
                    ┌─────────────┐
                    │  User Opens │
                    │    App      │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Check Auth │
                    │   Stored?   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │ YES        │            │ NO
              ▼            │            ▼
     ┌─────────────┐      │     ┌─────────────┐
     │ Auto Login  │      │     │  Show Login │
     │  & Redirect │      │     │    Page     │
     └──────┬──────┘      │     └──────┬──────┘
            │             │            │
            │             │            ▼
            │             │     ┌─────────────┐
            │             │     │  User Enter │
            │             │     │ Email/Pass  │
            │             │     └──────┬──────┘
            │             │            │
            │             │            ▼
            │             │     ┌─────────────┐
            │             │     │  Validate   │
            │             │     │ Credentials │
            │             │     └──────┬──────┘
            │             │            │
            │             │     ┌──────┼──────┐
            │             │     │ VALID│      │INVALID
            │             │     ▼      │      ▼
            │             │  ┌──────┐  │  ┌──────────┐
            │             │  │Store │  │  │ Show     │
            │             │  │User  │  │  │ Error    │
            │             │  └──┬───┘  │  └──────────┘
            │             │     │      │
            └─────────────┼─────┘      │
                          │            │
                          ▼            │
                   ┌─────────────┐    │
                   │ Route Based │    │
                   │ on Role     │    │
                   └──────┬──────┘    │
                          │           │
          ┌───────────────┼───────────┘
          │               │
          ▼               ▼
   ┌─────────────┐ ┌─────────────┐
   │   Admin:    │ │   Staff:    │
   │ All Pages   │ │ POS/Orders/ │
   └─────────────┘ │ Chatbot Only│
                   └─────────────┘
```

### 2. Order Processing Workflow

```
    ┌──────────────┐
    │  Staff Opens │
    │  POS Terminal│
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐     ┌──────────────┐
    │ Select Table │────►│ Choose Order │
    │ & Order Type │     │    Type      │
    └──────┬───────┘     └──────────────┘
           │
           ▼
    ┌──────────────┐
    │ Browse Menu  │
    │ Search/Filter│
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐     ┌──────────────┐
    │ Click Item ──┼──►  │ Add to Cart  │
    │   to Add     │     │ Quantity +1  │
    └──────────────┘     └──────┬───────┘
                                │
                   ┌────────────┼────────────┐
                   │            │            │
                   ▼            ▼            ▼
            ┌──────────┐ ┌──────────┐ ┌──────────┐
            │  Add More │ │ Add Mod- │ │ Proceed  │
            │   Items   │ │ ifiers   │ │ to Pay   │
            └──────────┘ └──────────┘ └────┬─────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ Apply        │
                                    │ Discount     │
                                    │ (Optional)   │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ Link Customer│
                                    │ (Optional)   │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ Select       │
                                    │ Payment Method│
                                    │ Cash/Card/UPI│
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │   Place      │
                                    │   Order      │
                                    └──────┬───────┘
                                           │
                        ┌──────────────────┼──────────────────┐
                        │                  │                  │
                        ▼                  ▼                  ▼
                 ┌────────────┐    ┌────────────┐    ┌────────────┐
                 │ Deduct Stock│   │ Create     │    │ Award      │
                 │ from        │   │ Order      │    │ Loyalty    │
                 │ Inventory   │   │ Record     │    │ Points     │
                 └────────────┘    └─────┬──────┘    └────────────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │  Kitchen     │
                                  │  Receives    │
                                  │  Order       │
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │  Status:     │
                                  │  PREPARING   │
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │  Mark as     │
                                  │  READY       │
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │  Complete    │
                                  │  Order       │
                                  │  (Release    │
                                  │   Table)     │
                                  └──────────────┘
```

### 3. Inventory Management Flow

```
    ┌──────────────────┐
    │  View Inventory  │
    │     Page         │
    └────────┬─────────┘
             │
             ▼
    ┌──────────────────┐
    │  Stock Level     │
    │  Monitoring      │
    └────────┬─────────┘
             │
    ┌────────┼────────────────────┐
    │        │                    │
    ▼        ▼                    ▼
┌────────┐ ┌────────┐      ┌────────┐
│ Stock  │ │ Stock  │      │ Stock  │
│  HIGH  │ │  LOW   │      │  OUT   │
│  (>10) │ │ (1-10) │      │  (0)   │
└────────┘ └───┬────┘      └───┬────┘
               │                │
               ▼                ▼
        ┌──────────┐     ┌──────────┐
        │  Show    │     │  Show    │
        │  Warning │     │  Alert   │
        │  Badge   │     │  Badge   │
        └──────────┘     └──────────┘
               │                │
               └───────┬────────┘
                       │
                       ▼
                ┌──────────────┐
                │   Restock    │
                │   (+50)      │
                └──────┬───────┘
                       │
                       ▼
                ┌──────────────┐
                │ Stock Updated│
                │ Badge Removed│
                └──────────────┘
```

### 4. Customer Loyalty Flow

```
    ┌──────────────┐
    │  Customer    │
    │  Places Order│
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Link Customer│
    │ to Order     │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Order Total  │
    │ = $50        │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Earn Points  │
    │ 50 × 1 = 50  │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │ Add to Total │
    │ Points       │
    └──────┬───────┘
           │
           ▼
    ┌──────────────────────────────────────┐
    │         Check Tier Upgrade           │
    └──────────────┬───────────────────────┘
                   │
     ┌─────────────┼─────────────┬─────────────┐
     │             │             │             │
     ▼             ▼             ▼             ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ BRONZE  │  │ SILVER  │  │  GOLD   │  │PLATINUM │
│ 0-99pts │  │100-299  │  │300-999  │  │ 1000+   │
│ 0% off  │  │ 5% off  │  │ 10% off │  │ 15% off │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
```

### 5. Menu Management Flow

```
    ┌──────────────────┐
    │  Manager/Admin   │
    │  Opens Menu Mgmt │
    └────────┬─────────┘
             │
    ┌────────┼────────┐
    │        │        │
    ▼        ▼        ▼
┌────────┐┌────────┐┌────────┐
│  ADD   ││  EDIT  ││ DELETE │
│  NEW   ││  ITEM  ││  ITEM  │
│  ITEM  ││        ││        │
└───┬────┘└───┬────┘└───┬────┘
    │         │         │
    ▼         ▼         ▼
┌────────┐┌────────┐┌────────┐
│ Fill   ││Modify  ││Confirm │
│ Form   ││Details ││Delete  │
│ Name   ││ Price  ││        │
│ Price  ││ Stock  │└───┬────┘
│ Cost   ││ Desc   │    │
│ Stock  ││ Avail  │    ▼
│ Desc   │└───┬────┘┌────────┐
│ Icon   │    │     │  Item  │
└───┬────┘    ▼     │ Removed│
    │      ┌────────┐└────────┘
    ▼      │ Item   │
┌────────┐ │ Updated│
│ Item   │ └────────┘
│ Added  │
└────────┘
```

---

## 🔐 Access Management

### Navigation Access

| Feature | 👨‍💼 Admin | 👨‍🍳 Manager | 👩‍🍳 Staff |
|---------|:---------:|:---------:|:--------:|
| **🛒 POS Terminal** | ✅ | ✅ | ✅ |
| **📋 Orders** | ✅ | ✅ | ✅ |
| **🪑 Tables** | ✅ | ✅ | ✅ |
| **💬 Chatbot** | ✅ | ✅ | ✅ |
| **📊 Dashboard** | ✅ | ✅ | ❌ |
| **📈 Reports** | ✅ | ✅ | ❌ |
| **📝 Menu Management** | ✅ | ✅ | ❌ |
| **📦 Inventory** | ✅ | ✅ | ❌ |
| **👥 Staff Management** | ✅ | ✅ | ❌ |
| **💎 Customers** | ✅ | ✅ | ❌ |
| **⚙️ Settings** | ✅ | ❌ | ❌ |

### Action-Level Permissions

| Action | 👨‍💼 Admin | 👨‍🍳 Manager | 👩‍🍳 Staff |
|--------|:---------:|:---------:|:--------:|
| **POS** | | | |
| Add items to cart | ✅ | ✅ | ✅ |
| Apply modifiers | ✅ | ✅ | ✅ |
| Apply discounts | ✅ | ✅ | ✅ |
| Place orders | ✅ | ✅ | ✅ |
| Clear cart | ✅ | ✅ | ✅ |
| **Orders** | | | |
| View all orders | ✅ | ✅ | ✅ |
| Update status | ✅ | ✅ | ✅ |
| Complete orders | ✅ | ✅ | ✅ |
| Cancel orders | ✅ | ✅ | ✅ |
| **Menu** | | | |
| View menu items | ✅ | ✅ | ✅ |
| Add new items | ✅ | ✅ | ❌ |
| Edit items | ✅ | ✅ | ❌ |
| Delete items | ✅ | ✅ | ❌ |
| Toggle availability | ✅ | ✅ | ❌ |
| **Inventory** | | | |
| View stock levels | ✅ | ✅ | ❌ |
| Restock items | ✅ | ✅ | ❌ |
| **Staff** | | | |
| View team members | ✅ | ✅ | ❌ |
| Add / Edit / Remove | ✅ | ✅ | ❌ |
| **Customers** | | | |
| View customers | ✅ | ✅ | ❌ |
| Add / Edit / Delete | ✅ | ✅ | ❌ |
| **Settings** | | | |
| View & Edit settings | ✅ | ❌ | ❌ |

### Dashboard Access

| Metric | 👨‍💼 Admin | 👨‍🍳 Manager | 👩‍🍳 Staff |
|--------|:---------:|:---------:|:--------:|
| Revenue | ✅ | ✅ | ❌ |
| Profit | ✅ | ✅ | ❌ |
| Total orders | ✅ | ✅ | ❌ |
| Popular items | ✅ | ✅ | ❌ |
| Category sales | ✅ | ✅ | ❌ |
| Low stock alerts | ✅ | ✅ | ❌ |
| Hourly sales chart | ✅ | ✅ | ❌ |

### Reports Access

| Report | 👨‍💼 Admin | 👨‍🍳 Manager | 👩‍🍳 Staff |
|--------|:---------:|:---------:|:--------:|
| Revenue by period | ✅ | ✅ | ❌ |
| Top selling items | ✅ | ✅ | ❌ |
| Payment breakdown | ✅ | ✅ | ❌ |
| Order type distribution | ✅ | ✅ | ❌ |
| Hourly distribution | ✅ | ✅ | ❌ |
| CSV export | ✅ | ✅ | ❌ |

### Login Credentials

| Role | Email | Password |
|------|-------|----------|
| 👨‍💼 **Admin** | admin@foodiepos.com | admin123 |
| 👨‍🍳 **Manager** | manager@foodiepos.com | manager123 |
| 👩‍🍳 **Staff** | staff@foodiepos.com | staff123 |

### Role Summary

| | Admin | Manager | Staff |
|--|-------|---------|-------|
| **Can access Settings** | ✅ Only | ❌ | ❌ |
| **Can manage staff** | ✅ | ✅ | ❌ |
| **Can see financials** | ✅ | ✅ | ❌ |
| **Can modify menu** | ✅ | ✅ | ❌ |
| **Can manage inventory** | ✅ | ✅ | ❌ |
| **Can export reports** | ✅ | ✅ | ❌ |
| **Scope** | Full control | Operations | Front-of-house |

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         DATA FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USER INPUT         STATE              PERSISTENCE               │
│  ─────────         ─────              ───────────                │
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────────┐                 │
│  │ Login   │───►│  Auth   │───►│ localStorage│                 │
│  │ Form    │    │  State  │    │ currentUser │                 │
│  └─────────┘    └─────────┘    └─────────────┘                 │
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────────┐                 │
│  │ POS     │───►│  Cart   │───►│ localStorage│                 │
│  │ Actions │    │  State  │    │ orders[]    │                 │
│  └─────────┘    └────┬────┘    └─────────────┘                 │
│                      │                                           │
│                      ▼                                           │
│               ┌─────────┐    ┌─────────────┐                   │
│               │  Order  │───►│ localStorage│                   │
│               │ Created │    │ orders[]    │                   │
│               └────┬────┘    └─────────────┘                   │
│                    │                                             │
│          ┌─────────┼─────────┐                                  │
│          ▼         ▼         ▼                                  │
│   ┌──────────┐┌──────────┐┌──────────┐                         │
│   │ Stock    ││ Loyalty  ││ Table    │                         │
│   │ Updated  ││ Points   ││ Status   │                         │
│   │ menu[]   ││ customers││ tables[] │                         │
│   └──────────┘└──────────┘└──────────┘                         │
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────────┐                 │
│  │Settings │───►│ Config  │───►│ localStorage│                 │
│  │ Changes │    │ State   │    │ settings{}  │                 │
│  └─────────┘    └─────────┘    └─────────────┘                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Features Overview

### 🛒 POS Terminal
- **24 menu items** across 4 categories with real-time search & filter
- **Cart management** — add, remove, quantity controls with smooth animations
- **Item modifiers** — Extra Cheese, Spicy, Gluten-Free, No Onions, Extra Sauce
- **Order types** — Dine-In (20-table selection), Takeaway, Delivery
- **Discounts** — Fixed amount or percentage-based
- **Customer linking** — Assign orders to loyalty members for points
- **Multi-payment** — Cash, Card, UPI with visual selection
- **Tax calculation** — Configurable tax rate (default 8%)
- **Auto stock deduction** on order placement
- **Responsive grid layout** — Properly spaced product cards with clear text

### 📋 Order Management
- Real-time status tracking: **Preparing → Ready → Completed**
- Cancel orders with table auto-release
- View order details (items, total, time, staff who created)
- Visual order cards with status color coding

### 🪑 Table Management
- Visual table layout (20 tables) with interactive cards
- Color-coded status: **Green** (Available) / **Amber** (Occupied)
- Click to assign orders to tables
- Quick navigation to active orders
- Auto-release on order completion

### 📊 Dashboard
- **Revenue & Profit** tracking with real-time updates
- **Hourly sales** bar chart for peak hours
- **Popular items** ranking with sales count
- **Category sales** breakdown with progress bars
- **Low stock alerts** for inventory management
- **Recent orders** quick view feed

### 📈 Reports & Analytics
- Filter by: **Today / This Week / This Month / All Time**
- Revenue, Profit, Tax collected metrics
- **Top selling items** with profit per item calculation
- **Payment method** breakdown (Cash/Card/UPI)
- **Order type** distribution (Dine-In/Takeaway/Delivery)
- **Hourly sales** distribution chart
- **CSV Export** for all reports

### 📝 Menu Management
- **Add / Edit / Delete** menu items with full form
- Set prices, costs, stock levels, prep time
- Toggle item availability (Active/Inactive)
- Category filtering across Appetizers, Main Course, Desserts, Beverages
- **Emoji icon picker** for visual item representation

### 📦 Inventory Management
- Track stock levels across all 24 items
- **Low stock** & **out-of-stock** visual alerts
- **One-click restock** (+50 units)
- Sort by name, stock level, or inventory value
- Filter by stock status (All/Low/Out/In Stock)

### 👥 Staff Management
- **Add / Edit / Remove** team members
- Assign roles (Admin, Manager, Staff)
- Avatar selection from preset options
- Contact info & join date tracking

### 💎 Customer & Loyalty System
- Customer database with contact info
- **4 loyalty tiers** with automatic upgrades:
  - 🥉 **Bronze** — 0+ points (baseline)
  - 🥈 **Silver** — 100+ points (5% discount)
  - 🥇 **Gold** — 300+ points (10% discount)
  - 💎 **Platinum** — 1000+ points (15% discount)
- Points earned per dollar spent
- Visit & spending history tracking

### 💬 AI Chatbot
- **Natural language** understanding for common queries
- Answers about: menu, hours, specials, allergens, reservations, contact
- **Real-time stats** — today's orders, revenue, pending count
- **Order status** checking
- **Loyalty program** info and tier lookup
- **Quick action buttons** for instant responses
- Works offline with pre-built knowledge base

### ⚙️ Settings
- Restaurant profile (name, address, phone, email, website)
- **Tax rate** & service charge configuration
- **Low stock threshold** setting
- **Loyalty program** toggle & points-per-dollar config
- **Receipt** custom header/footer messages
- **Opening hours** per day of week with open/close toggle

### 🌙 Dark Mode
- Toggle between light and dark themes
- Persists across sessions

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **Vite** | Build Tool & Dev Server |
| **Context API + useReducer** | State Management |
| **localStorage** | Data Persistence |
| **CSS3** | Custom Styling (No external UI library) |

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

## 📁 Project Structure

```
Foodie/
├── src/
│   ├── components/
│   │   └── shared/
│   │       ├── Sidebar.jsx / Sidebar.css      # Navigation sidebar with role-based menu
│   │       ├── TopBar.jsx / TopBar.css        # Top bar with user info & theme toggle
│   │       ├── Modal.jsx / Modal.css          # Reusable modal component
│   │       └── Notification.jsx / .css        # Toast notification system
│   ├── context/
│   │   └── AppContext.jsx                     # Global state (reducer + actions)
│   ├── data/
│   │   ├── menuData.js                        # 24 menu items, categories, modifiers
│   │   ├── users.js                           # Default accounts & role definitions
│   │   ├── customers.js                       # Sample customers & loyalty tiers
│   │   └── settings.js                        # Default restaurant configuration
│   ├── pages/
│   │   ├── Login.jsx / Login.css              # Auth page with demo accounts
│   │   ├── POS.jsx / POS.css                  # Main ordering terminal
│   │   ├── Orders.jsx / Orders.css            # Order management & tracking
│   │   ├── Tables.jsx / Tables.css            # Visual table layout
│   │   ├── Dashboard.jsx / Dashboard.css      # Analytics dashboard
│   │   ├── Reports.jsx / Reports.css          # Detailed reports & CSV export
│   │   ├── MenuMgmt.jsx / MenuMgmt.css       # Menu item CRUD
│   │   ├── Inventory.jsx / Inventory.css      # Stock tracking
│   │   ├── Staff.jsx / Staff.css              # Employee management
│   │   ├── Customers.jsx / Customers.css      # Customer & loyalty management
│   │   ├── Chatbot.jsx / Chatbot.css          # AI chatbot assistant
│   │   └── Settings.jsx / Settings.css        # Restaurant configuration
│   ├── utils/
│   │   └── helpers.js                         # Utility functions
│   ├── App.jsx / App.css                      # Root component & layout
│   ├── index.css                              # Global styles
│   └── main.jsx                               # Entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## 🔧 Configuration

All settings are configurable through the **Settings** page (Admin only):

| Setting | Default | Description |
|---------|---------|-------------|
| Tax Rate | 8% | Applied to all orders |
| Low Stock Threshold | 10 units | Triggers low stock alerts |
| Loyalty Points | 1 per dollar | Points earned per $1 spent |
| Opening Hours | 11am-10pm (Mon-Thu) | Per-day configuration |
| Service Charge | 0% | Optional additional charge |
| Receipt Header | "Thank you for dining with us!" | Customizable |
| Receipt Footer | "Visit us at www.foodiepos.com" | Customizable |

---

## 🔨 Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

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

## 📊 Stats

- **24** menu items across 4 categories
- **3** user roles with different permissions
- **20** tables for dine-in management
- **5** item modifiers for customization
- **4** loyalty tiers for customer rewards
- **3** payment methods supported
- **10+** chatbot response topics

---

<p align="center">
  Made with ❤️ for restaurant owners who want a modern, business-ready POS experience
</p>
