import { useApp } from "../context/AppContext";
import { formatCurrency, getGreeting, getToday } from "../utils/helpers";
import "./Dashboard.css";

export default function Dashboard() {
  const { orders, menu, customers, settings, currentUser } = useApp();

  const today = getToday();
  const todayOrders = orders.filter((o) => o.createdAt?.startsWith(today));
  const totalRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const completedOrders = todayOrders.filter((o) => o.status === "completed");
  const completedRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = todayOrders.filter((o) => o.status === "preparing" || o.status === "ready");
  const avgOrderValue = todayOrders.length > 0 ? totalRevenue / todayOrders.length : 0;
  const totalItems = menu.reduce((sum, m) => sum + m.stock, 0);
  const lowStockItems = menu.filter((m) => m.stock <= settings.lowStockThreshold);
  const totalCustomers = customers.length;

  const categorySales = {};
  todayOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!categorySales[item.category]) categorySales[item.category] = 0;
      categorySales[item.category] += item.price * item.quantity;
    });
  });

  const popularItems = {};
  todayOrders.forEach((order) => {
    order.items.forEach((item) => {
      if (!popularItems[item.name]) popularItems[item.name] = { count: 0, revenue: 0, image: item.image };
      popularItems[item.name].count += item.quantity;
      popularItems[item.name].revenue += item.price * item.quantity;
    });
  });
  const sortedPopular = Object.entries(popularItems).sort((a, b) => b[1].count - a[1].count).slice(0, 5);

  const hourlySales = Array(24).fill(0);
  todayOrders.forEach((order) => {
    const hour = new Date(order.createdAt).getHours();
    hourlySales[hour] += order.total;
  });
  const maxHourlySale = Math.max(...hourlySales, 1);

  const profit = completedRevenue - completedOrders.reduce((sum, o) => {
    return sum + o.items.reduce((s, item) => s + (item.cost || 0) * item.quantity, 0);
  }, 0);

  return (
    <div className="dashboard">
      <div className="dash-welcome">
        <div>
          <h2>{getGreeting()}, {currentUser?.name}!</h2>
          <p>Here's your restaurant overview for today</p>
        </div>
        <div className="dash-date">{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
      </div>

      <div className="dash-cards">
        <div className="dc revenue">
          <div className="dc-icon">💰</div>
          <div className="dc-info">
            <span className="dc-value">{formatCurrency(totalRevenue)}</span>
            <span className="dc-label">Total Revenue</span>
          </div>
        </div>
        <div className="dc profit">
          <div className="dc-icon">📈</div>
          <div className="dc-info">
            <span className="dc-value">{formatCurrency(profit)}</span>
            <span className="dc-label">Profit</span>
          </div>
        </div>
        <div className="dc orders-count">
          <div className="dc-icon">📋</div>
          <div className="dc-info">
            <span className="dc-value">{todayOrders.length}</span>
            <span className="dc-label">Total Orders</span>
          </div>
        </div>
        <div className="dc pending">
          <div className="dc-icon">⏳</div>
          <div className="dc-info">
            <span className="dc-value">{pendingOrders.length}</span>
            <span className="dc-label">Pending</span>
          </div>
        </div>
        <div className="dc avg">
          <div className="dc-icon">🎯</div>
          <div className="dc-info">
            <span className="dc-value">{formatCurrency(avgOrderValue)}</span>
            <span className="dc-label">Avg Order</span>
          </div>
        </div>
        <div className="dc customers">
          <div className="dc-icon">👥</div>
          <div className="dc-info">
            <span className="dc-value">{totalCustomers}</span>
            <span className="dc-label">Customers</span>
          </div>
        </div>
        <div className="dc items">
          <div className="dc-icon">📦</div>
          <div className="dc-info">
            <span className="dc-value">{totalItems}</span>
            <span className="dc-label">Total Stock</span>
          </div>
        </div>
        <div className={`dc ${lowStockItems.length > 0 ? "low-stock-alert" : "low-stock"}`}>
          <div className="dc-icon">⚠️</div>
          <div className="dc-info">
            <span className="dc-value">{lowStockItems.length}</span>
            <span className="dc-label">Low Stock</span>
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-section">
          <h3>⏰ Hourly Sales</h3>
          <div className="hourly-chart">
            {hourlySales.slice(8, 23).map((sale, i) => (
              <div key={i} className="hour-col">
                <div className="hour-bar-container">
                  <div
                    className="hour-bar"
                    style={{ height: `${(sale / maxHourlySale) * 100}%` }}
                    title={formatCurrency(sale)}
                  />
                </div>
                <span className="hour-label">{i + 8}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="dash-section">
          <h3>🔥 Popular Items</h3>
          {sortedPopular.length === 0 ? (
            <p className="no-data">No sales data yet</p>
          ) : (
            <div className="popular-list">
              {sortedPopular.map(([name, data], idx) => (
                <div key={name} className="pop-item">
                  <span className="pop-rank">#{idx + 1}</span>
                  <span className="pop-icon">{data.image}</span>
                  <div className="pop-info">
                    <span className="pop-name">{name}</span>
                    <span className="pop-rev">{formatCurrency(data.revenue)}</span>
                  </div>
                  <span className="pop-count">{data.count} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-section">
          <h3>📈 Category Sales</h3>
          {Object.keys(categorySales).length === 0 ? (
            <p className="no-data">No sales data yet</p>
          ) : (
            <div className="cat-sales">
              {Object.entries(categorySales).map(([cat, sales]) => (
                <div key={cat} className="cat-row">
                  <div className="cat-header">
                    <span>{cat}</span>
                    <span>{formatCurrency(sales)}</span>
                  </div>
                  <div className="cat-bar-bg">
                    <div className="cat-bar" style={{ width: `${(sales / totalRevenue) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-section">
          <h3>📝 Recent Orders</h3>
          {todayOrders.length === 0 ? (
            <p className="no-data">No orders today</p>
          ) : (
            <div className="recent-orders">
              {todayOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="ro-item">
                  <div className="ro-left">
                    <span className="ro-id">#{order.id.slice(-4).toUpperCase()}</span>
                    <span className={`ro-status ${order.status}`}>{order.status}</span>
                  </div>
                  <div className="ro-right">
                    <span>{order.items.length} items</span>
                    <span className="ro-total">{formatCurrency(order.total)}</span>
                    <span className="ro-type">{order.type === "dine-in" ? `T${order.table}` : order.type === "takeaway" ? "📦" : "🚗"}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-section">
          <h3>⚠️ Low Stock Alerts</h3>
          {lowStockItems.length === 0 ? (
            <p className="no-data">All items well stocked</p>
          ) : (
            <div className="low-stock-list">
              {lowStockItems.map((item) => (
                <div key={item.id} className="ls-item">
                  <span className="ls-icon">{item.image}</span>
                  <div className="ls-info">
                    <span className="ls-name">{item.name}</span>
                    <span className="ls-cat">{item.category}</span>
                  </div>
                  <span className={`ls-stock ${item.stock === 0 ? "out" : "low"}`}>
                    {item.stock === 0 ? "OUT" : `${item.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
