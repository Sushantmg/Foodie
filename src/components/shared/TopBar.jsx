import { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import "./TopBar.css";

function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const date = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  return (
    <div className="live-clock">
      <span className="clock-time">{time}</span>
      <span className="clock-date">{date}</span>
    </div>
  );
}

export default function TopBar() {
  const { currentUser, logout, darkMode, dispatch, getCartItemCount, orders, activeTab } = useApp();

  const preparingCount = orders.filter((o) => o.status === "preparing").length;
  const readyCount = orders.filter((o) => o.status === "ready").length;
  const activeCount = preparingCount + readyCount;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="page-title">
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace("-", " ")}
        </h2>
      </div>

      <div className="topbar-right">
        <LiveClock />

        <div className="topbar-divider" />

        <div
          className={`topbar-orders-pill ${activeCount > 0 ? "has-orders" : ""}`}
          onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: "kds" })}
          title={`Kitchen: ${preparingCount} preparing, ${readyCount} ready`}
        >
          <span className="pill-icon">👨‍🍳</span>
          {activeCount > 0 && <span className="pill-count">{activeCount}</span>}
        </div>

        <button
          className="theme-toggle"
          onClick={() => dispatch({ type: "TOGGLE_DARK_MODE" })}
          title="Toggle dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {activeTab === "pos" && (
          <div className="cart-badge-topbar">
            <span>🛒</span>
            <span className="badge">{getCartItemCount()}</span>
          </div>
        )}

        <div className="user-menu">
          <span className="user-avatar">{currentUser?.avatar}</span>
          <div className="user-info">
            <span className="user-name">{currentUser?.name}</span>
            <span className="user-role">{currentUser?.role}</span>
          </div>
          <button className="logout-btn" onClick={logout} title="Sign out">
            🚪
          </button>
        </div>
      </div>
    </header>
  );
}
