import { useApp } from "../../context/AppContext";
import "./TopBar.css";

export default function TopBar() {
  const { currentUser, logout, darkMode, dispatch, getCartItemCount } = useApp();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="page-title">
          {useApp().activeTab.charAt(0).toUpperCase() + useApp().activeTab.slice(1).replace("-", " ")}
        </h2>
      </div>

      <div className="topbar-right">
        <button
          className="theme-toggle"
          onClick={() => dispatch({ type: "TOGGLE_DARK_MODE" })}
          title="Toggle dark mode"
        >
          {darkMode ? "☀️" : "🌙"}
        </button>

        {useApp().activeTab === "pos" && (
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
