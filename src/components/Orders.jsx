import { usePOS } from "../context/POSContext";
import "./Orders.css";

export default function Orders() {
  const { orders, updateOrderStatus } = usePOS();

  const getStatusColor = (status) => {
    switch (status) {
      case "preparing": return "#f59e0b";
      case "ready": return "#10b981";
      case "completed": return "#6b7280";
      case "cancelled": return "#ef4444";
      default: return "#6b7280";
    }
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h2>Order Management</h2>
        <div className="order-stats">
          <div className="stat">
            <span className="stat-num">
              {orders.filter((o) => o.status === "preparing").length}
            </span>
            <span className="stat-label">Preparing</span>
          </div>
          <div className="stat">
            <span className="stat-num">
              {orders.filter((o) => o.status === "ready").length}
            </span>
            <span className="stat-label">Ready</span>
          </div>
          <div className="stat">
            <span className="stat-num">
              {orders.filter((o) => o.status === "completed").length}
            </span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <span className="no-orders-icon">📋</span>
          <h3>No Orders Yet</h3>
          <p>Orders will appear here once placed</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-id">
                  <h3>#{order.id.toString().slice(-4)}</h3>
                  <span
                    className="order-status"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="order-meta">
                  <span>
                    {order.type === "dine-in"
                      ? `🍽️ Table ${order.table}`
                      : order.type === "takeaway"
                        ? "📦 Takeaway"
                        : "🚗 Delivery"}
                  </span>
                  <span>🕐 {order.time}</span>
                </div>
              </div>
              <div className="order-items-list">
                {order.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <span>
                      {item.image} {item.name} x{item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="order-card-footer">
                <span className="order-total">
                  Total: ${order.total.toFixed(2)}
                </span>
                <div className="order-actions">
                  {order.status === "preparing" && (
                    <button
                      className="status-btn ready"
                      onClick={() => updateOrderStatus(order.id, "ready")}
                    >
                      Mark Ready
                    </button>
                  )}
                  {order.status === "ready" && (
                    <button
                      className="status-btn complete"
                      onClick={() => updateOrderStatus(order.id, "completed")}
                    >
                      Complete
                    </button>
                  )}
                  {order.status !== "completed" && order.status !== "cancelled" && (
                    <button
                      className="status-btn cancel"
                      onClick={() => updateOrderStatus(order.id, "cancelled")}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
