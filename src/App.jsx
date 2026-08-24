import { useState } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Login from "./pages/Login";
import Sidebar from "./components/shared/Sidebar";
import TopBar from "./components/shared/TopBar";
import Notification from "./components/shared/Notification";
import POS from "./pages/POS";
import Orders from "./pages/Orders";
import Tables from "./pages/Tables";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import MenuMgmt from "./pages/MenuMgmt";
import Inventory from "./pages/Inventory";
import Staff from "./pages/Staff";
import Customers from "./pages/Customers";
import Chatbot from "./pages/Chatbot";
import Settings from "./pages/Settings";
import KDS from "./pages/KDS";
import "./App.css";

function AppLayout() {
  const { currentUser, activeTab } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!currentUser) return <Login />;

  const renderPage = () => {
    switch (activeTab) {
      case "pos": return <POS />;
      case "orders": return <Orders />;
      case "tables": return <Tables />;
      case "dashboard": return <Dashboard />;
      case "reports": return <Reports />;
      case "menu-mgmt": return <MenuMgmt />;
      case "inventory": return <Inventory />;
      case "staff": return <Staff />;
      case "customers": return <Customers />;
      case "kds": return <KDS />;
      case "chatbot": return <Chatbot />;
      case "settings": return <Settings />;
      default: return <POS />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <div className="app-main">
        <TopBar />
        <div className="app-content">{renderPage()}</div>
      </div>
      <Notification />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppLayout />
    </AppProvider>
  );
}

export default App;
