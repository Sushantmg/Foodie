import { useApp } from "../context/AppContext";
import { formatCurrency, formatTime } from "../utils/helpers";
import "./Orders.css";

export default function Orders() {
  const { orders, dispatch, notify } = useApp();

  const activeOrders = orders.filter((o) => o.status === "preparing" || o.status === "ready");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  const handleStatus = (orderId, status) => {
    dispatch({ type: "UPDATE_ORDER_STATUS", payload: { orderId, status } });
    notify(`Order updated to ${status}`, status === "completed" ? "success" : "info");
  };

  return (
    <div className="orders-page">
      <div className="orders-stats">
        <div className="os-card">
          <span className="os-num preparing">{activeOrders.filter((o) => o.status === "preparing").length}</span>
          <span className="os-label">Preparing</span>
        </div>
        <div className="os-card">
          <span className="os-num ready">{activeOrders.filter((o) => o.status === "ready").length}</span>
          <span className="os-label">Ready</span>
        </div>
        <div className="os-card">
          <span className="os-num completed">{completedOrders.length}</span>
          <span className="os-label">Completed</span>
        </div>
        <div className="os-card">
          <span className="os-num cancelled">{cancelledOrders.length}</span>
          <span className="os-label">Cancelled</span>
        </div>
      </div>

      <div className="orders-section">
        <h3>🔥 Active Orders ({activeOrders.length})</h3>
        {activeOrders.length === 0 ? (
          <div className="no-orders">No active orders</div>
        ) : (
          <div className="orders-grid">
            {activeOrders.map((order) => (
              <div key={order.id} className={`order-card ${order.status}`}>
                <div className="oc-header">
                  <div className="oc-id">
                    <span className="oc-hash">#{order.id.slice(-4).toUpperCase()}</span>
                    <span className={`oc-status ${order.status}`}>{order.status}</span>
                  </div>
                  <div className="oc-type">
                    {order.type === "dine-in" ? `🍽️ T${order.table}` : order.type === "takeaway" ? "📦 Takeaway" : "🚗 Delivery"}
                  </div>
                </div>
                <div className="oc-items">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="oc-item">
                      <span>{item.image} {item.name} x{item.quantity}</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="oc-footer">
                  <div className="oc-meta">
                    <span>💰 {formatCurrency(order.total)}</span>
                    <span>🕐 {formatTime(order.createdAt)}</span>
                    <span>👤 {order.createdByName}</span>
                  </div>
                  <div className="oc-actions">
                    {order.status === "preparing" && (
                      <button className="oc-btn ready" onClick={() => handleStatus(order.id, "ready")}>Ready</button>
                    )}
                    {order.status === "ready" && (
                      <button className="oc-btn complete" onClick={() => handleStatus(order.id, "completed")}>Complete</button>
                    )}
                    <button className="oc-btn cancel" onClick={() => handleStatus(order.id, "cancelled")}>Cancel</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="orders-section">
        <h3>✅ Completed ({completedOrders.length})</h3>
        {completedOrders.length > 0 && (
          <div className="orders-grid">
            {completedOrders.slice(0, 10).map((order) => (
              <div key={order.id} className="order-card completed">
                <div className="oc-header">
                  <div className="oc-id">
                    <span className="oc-hash">#{order.id.slice(-4).toUpperCase()}</span>
                    <span className="oc-status completed">completed</span>
                  </div>
                  <span className="oc-total">{formatCurrency(order.total)}</span>
                </div>
                <div className="oc-footer">
                  <span className="oc-time">{formatTime(order.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
