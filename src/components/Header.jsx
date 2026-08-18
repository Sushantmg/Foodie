import { usePOS } from "../context/POSContext";
import "./Header.css";

export default function Header() {
  const { activeTab, setActiveTab, getCartItemCount } = usePOS();

  return (
    <header className="header">
      <div className="header-brand">
        <span className="brand-icon">🍽️</span>
        <h1>FoodiePOS</h1>
      </div>
      <nav className="header-nav">
        <button
          className={`nav-btn ${activeTab === "pos" ? "active" : ""}`}
          onClick={() => setActiveTab("pos")}
        >
          <span className="nav-icon">🛒</span>
          POS
        </button>
        <button
          className={`nav-btn ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          <span className="nav-icon">📋</span>
          Orders
        </button>
        <button
          className={`nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
          onClick={() => setActiveTab("dashboard")}
        >
          <span className="nav-icon">📊</span>
          Dashboard
        </button>
        <button
          className={`nav-btn chatbot-btn ${activeTab === "chatbot" ? "active" : ""}`}
          onClick={() => setActiveTab("chatbot")}
        >
          <span className="nav-icon">💬</span>
          Chatbot
        </button>
      </nav>
      <div className="header-info">
        <span className="header-time">
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </header>
  );
}
