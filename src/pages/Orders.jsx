import { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency, formatTime } from "../utils/helpers";
import Modal from "../components/shared/Modal";
import { playOrderReady, playOrderCancelled } from "../utils/sounds";
import "./Orders.css";

function OrderTimer({ createdAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calc = () => Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
    setElapsed(calc());
    const interval = setInterval(() => setElapsed(calc()), 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const isLong = mins > 15;

  return (
    <span className={`order-timer ${isLong ? "long" : ""}`}>
      ⏱️ {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
}

function ReceiptPreview({ order, settings, onClose }) {
  return (
    <div className="receipt-preview">
      <div className="receipt-paper">
        <div className="receipt-center">
          <span className="receipt-logo">🍽️</span>
          <h3>{settings.restaurantName}</h3>
          <p>{settings.address}</p>
          <p>{settings.phone}</p>
        </div>
        <div className="receipt-divider">{'─'.repeat(36)}</div>
        <div className="receipt-row">
          <span>Order #{order.id.slice(-4).toUpperCase()}</span>
          <span>{formatTime(order.createdAt)}</span>
        </div>
        <div className="receipt-row">
          <span>Type:</span>
          <span>{order.type === "dine-in" ? `Dine-In (Table ${order.table})` : order.type}</span>
        </div>
        <div className="receipt-row">
          <span>Staff:</span>
          <span>{order.createdByName}</span>
        </div>
        <div className="receipt-divider">{'─'.repeat(36)}</div>
        <div className="receipt-items">
          {order.items.map((item, idx) => (
            <div key={idx} className="receipt-item">
              <span>{item.name} x{item.quantity}</span>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="receipt-divider">{'─'.repeat(36)}</div>
        <div className="receipt-row"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
        {order.discount > 0 && <div className="receipt-row"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>}
        <div className="receipt-row"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
        <div className="receipt-row receipt-total"><span>TOTAL</span><span>{formatCurrency(order.total)}</span></div>
        <div className="receipt-divider">{'─'.repeat(36)}</div>
        <div className="receipt-row">
          <span>Payment:</span>
          <span>{order.paymentMethod?.toUpperCase()}</span>
        </div>
        <div className="receipt-center receipt-footer">
          <p>{settings.receiptHeader}</p>
          <p>{settings.receiptFooter}</p>
        </div>
      </div>
      <div className="receipt-actions">
        <button className="receipt-print" onClick={() => window.print()}>Print Receipt</button>
        <button className="receipt-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
}

export default function Orders() {
  const { orders, dispatch, notify, settings, menu } = useApp();
  const [showReceipt, setShowReceipt] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch = orderSearch === "" ||
        o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.createdByName?.toLowerCase().includes(orderSearch.toLowerCase()) ||
        String(o.table).includes(orderSearch);
      const matchStatus = statusFilter === "all" || o.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, statusFilter]);

  const activeOrders = filteredOrders.filter((o) => o.status === "preparing" || o.status === "ready");
  const completedOrders = filteredOrders.filter((o) => o.status === "completed");
  const cancelledOrders = filteredOrders.filter((o) => o.status === "cancelled");

  const handleStatus = (orderId, status) => {
    dispatch({ type: "UPDATE_ORDER_STATUS", payload: { orderId, status } });
    notify(`Order updated to ${status}`, status === "completed" ? "success" : "info");
    if (status === "ready") playOrderReady();
    if (status === "cancelled") playOrderCancelled();
  };

  const handleReorder = (order) => {
    order.items.forEach((item) => {
      const menuItem = menu.find((m) => m.id === item.id);
      if (menuItem && menuItem.available) {
        for (let i = 0; i < item.quantity; i++) {
          dispatch({ type: "ADD_TO_CART", payload: menuItem });
        }
      }
    });
    dispatch({ type: "SET_ACTIVE_TAB", payload: "pos" });
    notify(`Order #${order.id.slice(-4).toUpperCase()} items added to cart`);
  };

  return (
    <div className="orders-page">
      <div className="orders-filters">
        <input
          type="text"
          placeholder="Search by order ID, staff, or table..."
          value={orderSearch}
          onChange={(e) => setOrderSearch(e.target.value)}
          className="orders-search"
        />
        <div className="orders-filter-btns">
          {["all", "preparing", "ready", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              className={`of-btn ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

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
          <div className="no-orders">
            <span className="no-orders-icon">📋</span>
            <h4>No Active Orders</h4>
            <p>Orders will appear here once placed from POS</p>
          </div>
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
                <div className="oc-timer-row">
                  <OrderTimer createdAt={order.createdAt} />
                  {order.notes && <span className="oc-note-badge">📝 {order.notes}</span>}
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
                    <span>💳 {order.paymentMethod?.toUpperCase()}</span>
                  </div>
                  <div className="oc-actions">
                    <button className="oc-btn receipt" onClick={() => setShowReceipt(order)} title="View receipt">🧾</button>
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
        {completedOrders.length === 0 ? (
          <div className="no-orders small">
            <p>No completed orders yet</p>
          </div>
        ) : (
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
                  <div className="oc-meta">
                    <span>🕐 {formatTime(order.createdAt)}</span>
                    <span>👤 {order.createdByName}</span>
                  </div>
                  <div className="oc-actions">
                    <button className="oc-btn receipt" onClick={() => setShowReceipt(order)} title="View receipt">🧾</button>
                    <button className="oc-btn reorder" onClick={() => handleReorder(order)} title="Reorder">🔄</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showReceipt && (
        <Modal isOpen={true} onClose={() => setShowReceipt(null)} title="Receipt Preview" size="sm">
          <ReceiptPreview order={showReceipt} settings={settings} onClose={() => setShowReceipt(null)} />
        </Modal>
      )}
    </div>
  );
}
