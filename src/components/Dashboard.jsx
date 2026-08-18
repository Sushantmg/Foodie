import { usePOS } from "../context/POSContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { orders } = usePOS();

  const todayOrders = orders;
  const totalRevenue = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const completedOrders = todayOrders.filter((o) => o.status === "completed");
  const completedRevenue = completedOrders.reduce((sum, o) => sum + o.total, 0);
  const avgOrderValue = todayOrders.length > 0 ? totalRevenue / todayOrders.length : 0;

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
      if (!popularItems[item.name]) popularItems[item.name] = { count: 0, image: item.image };
      popularItems[item.name].count += item.quantity;
    });
  });

  const sortedPopular = Object.entries(popularItems)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="dashboard-cards">
        <div className="dash-card revenue">
          <div className="dash-card-icon">💰</div>
          <div className="dash-card-info">
            <h3>${totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="dash-card orders">
          <div className="dash-card-icon">📋</div>
          <div className="dash-card-info">
            <h3>{todayOrders.length}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="dash-card avg">
          <div className="dash-card-icon">📊</div>
          <div className="dash-card-info">
            <h3>${avgOrderValue.toFixed(2)}</h3>
            <p>Avg Order Value</p>
          </div>
        </div>
        <div className="dash-card completed">
          <div className="dash-card-icon">✅</div>
          <div className="dash-card-info">
            <h3>{completedOrders.length}</h3>
            <p>Completed</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dash-section">
          <h3>🔥 Popular Items</h3>
          {sortedPopular.length === 0 ? (
            <p className="no-data">No data yet</p>
          ) : (
            <div className="popular-list">
              {sortedPopular.map(([name, data], idx) => (
                <div key={name} className="popular-item">
                  <span className="pop-rank">#{idx + 1}</span>
                  <span className="pop-icon">{data.image}</span>
                  <span className="pop-name">{name}</span>
                  <span className="pop-count">{data.count} sold</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-section">
          <h3>📈 Category Sales</h3>
          {Object.keys(categorySales).length === 0 ? (
            <p className="no-data">No data yet</p>
          ) : (
            <div className="category-sales">
              {Object.entries(categorySales).map(([cat, sales]) => (
                <div key={cat} className="cat-sale-row">
                  <span>{cat}</span>
                  <div className="cat-bar-container">
                    <div
                      className="cat-bar"
                      style={{
                        width: `${(sales / totalRevenue) * 100}%`,
                      }}
                    />
                  </div>
                  <span>${sales.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="dash-section recent-orders">
          <h3>📝 Recent Orders</h3>
          {todayOrders.length === 0 ? (
            <p className="no-data">No orders yet</p>
          ) : (
            <div className="recent-list">
              {todayOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="recent-item">
                  <div className="recent-info">
                    <span className="recent-id">
                      #{order.id.toString().slice(-4)}
                    </span>
                    <span className="recent-type">
                      {order.type === "dine-in"
                        ? `Table ${order.table}`
                        : order.type}
                    </span>
                  </div>
                  <div className="recent-details">
                    <span>{order.items.length} items</span>
                    <span>${order.total.toFixed(2)}</span>
                    <span
                      className={`recent-status ${order.status}`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
