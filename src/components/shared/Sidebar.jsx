
import { useApp } from "../../context/AppContext";
import { APP_VERSION } from "../../utils/version";
import "./Sidebar.css";

const navItems = [
  { id: "pos", label: "POS", icon: "🛒", shortcut: "F1", roles: ["admin", "manager", "staff"] },
  { id: "orders", label: "Orders", icon: "📋", shortcut: "F2", roles: ["admin", "manager", "staff"] },
  { id: "tables", label: "Tables", icon: "🪑", roles: ["admin", "manager", "staff"] },
  { id: "dashboard", label: "Dashboard", icon: "📊", shortcut: "F3", roles: ["admin", "manager"] },
  { id: "reports", label: "Reports", icon: "📈", roles: ["admin", "manager"] },
  { id: "menu-mgmt", label: "Menu", icon: "📝", roles: ["admin", "manager"] },
  { id: "inventory", label: "Inventory", icon: "📦", roles: ["admin", "manager"] },
  { id: "staff", label: "Staff", icon: "👥", roles: ["admin", "manager"] },
  { id: "customers", label: "Customers", icon: "💎", roles: ["admin", "manager"] },
  { id: "kds", label: "Kitchen", icon: "👨‍🍳", shortcut: "F5", roles: ["admin", "manager", "staff"] },
  { id: "chatbot", label: "Chatbot", icon: "💬", shortcut: "F6", roles: ["admin", "manager", "staff"] },
  { id: "settings", label: "Settings", icon: "⚙️", roles: ["admin"] },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { currentUser, activeTab, dispatch, settings } = useApp();
  const filteredNav = navItems.filter((item) =>
    item.roles.includes(currentUser?.role)
  );

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-brand">
        <span className="brand-icon">🍽️</span>
        {!collapsed && <h2>FoodiePOS</h2>}
        <button className="collapse-btn" onClick={onToggle}>
          {collapsed ? "▶" : "◀"}
        </button>
      </div>

      <nav className="sidebar-nav">
        {filteredNav.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? "active" : ""}`}
            onClick={() => dispatch({ type: "SET_ACTIVE_TAB", payload: item.id })}
            title={collapsed ? item.label : ""}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && (
              <>
                <span className="nav-label">{item.label}</span>
                {item.shortcut && <span className="nav-shortcut">{item.shortcut}</span>}
              </>
            )}
          </button>
        ))}
      </nav>

      {!collapsed && (
        <div className="sidebar-footer">
          <div className="restaurant-info">
            <span className="info-label">Restaurant</span>
            <span className="info-value">{settings.restaurantName}</span>
          </div>
          <div className="sidebar-version">v{APP_VERSION}</div>
        </div>
      )}
    </aside>
  );
}
