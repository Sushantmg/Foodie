<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript"/>
</p>

<h1 align="center">🍽️ FoodiePOS</h1>

<p align="center">
  A modern, feature-rich Restaurant Point of Sale system with an AI-powered chatbot assistant
</p>

---

## ✨ Features

### 🛒 POS Terminal
- **20+ menu items** across 4 categories: Appetizers, Main Course, Desserts, Beverages
- **Smart search** - find items instantly
- **Category filtering** with one-click tabs
- **Cart management** - add, remove, adjust quantities
- **Order types** - Dine-In, Takeaway, Delivery
- **Table selection** (1-20 tables)
- **Tax calculation** (8% auto-applied)
- **Multi-payment support** - Cash, Card, UPI

### 📋 Order Management
- Real-time order status tracking (**Preparing → Ready → Completed**)
- Order cancellation support
- Live stats dashboard (Preparing / Ready / Completed counts)
- Visual order cards with full item breakdown

### 📊 Dashboard & Analytics
- **Revenue tracking** - total, completed, pending
- **Popular items** ranking with sales count
- **Category sales** breakdown with progress bars
- **Average order value** calculation
- **Recent orders** quick view

### 💬 AI Chatbot Assistant
- Answers questions about **menu, hours, specials, allergens, reservations, contact info**
- **Quick action buttons** for common queries
- **Order status** checking
- Natural language understanding
- 24/7 virtual assistant availability

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone git@github.com:Sushantmg/Foodie.git

# Navigate to project
cd Foodie

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

---

## 📁 Project Structure

```
restaurant-pos/
├── public/
├── src/
│   ├── components/
│   │   ├── Header.jsx / Header.css
│   │   ├── MenuGrid.jsx / MenuGrid.css
│   │   ├── Cart.jsx / Cart.css
│   │   ├── Orders.jsx / Orders.css
│   │   ├── Dashboard.jsx / Dashboard.css
│   │   └── Chatbot.jsx / Chatbot.css
│   ├── context/
│   │   └── POSContext.jsx
│   ├── data/
│   │   └── menuData.js
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React** | UI Framework |
| **Vite** | Build Tool & Dev Server |
| **Context API** | State Management |
| **CSS3** | Styling (No external libraries) |

---

## 📸 Screenshots

> **POS Terminal** - Browse menu, manage cart, checkout  
> **Order Management** - Track orders in real-time  
> **Dashboard** - Analytics and insights  
> **Chatbot** - AI-powered customer assistance

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Made with ❤️ for restaurant owners who want a modern POS experience
</p>
