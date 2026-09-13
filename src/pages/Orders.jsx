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
        {order.serviceCharge > 0 && <div className="receipt-row"><span>Service Charge</span><span>{formatCurrency(order.serviceCharge)}</span></div>}
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
  const { orders, dispatch, notify, settings, menu, voidOrder, refundOrder } = useApp();
  const [showReceipt, setShowReceipt] = useState(null);
  const [orderSearch, setOrderSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionOrder, setActionOrder] = useState(null);
  const [reason, setReason] = useState("");

  const handleExportCSV = () => {
    if (orders.length === 0) {
      notify("No orders to export", "warning");
      return;
    }
    const header = ["Order ID", "Date", "Type", "Table", "Status", "Priority", "Payment", "Items", "Subtotal", "Discount", "Tax", "Total", "Staff", "Customer"];
    const rows = orders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleString(),
      o.type,
      o.type === "dine-in" ? `Table ${o.table}` : "-",
      o.status,
      o.priority || "normal",
      o.paymentMethod || "-",
      o.items.map((i) => `${i.name} x${i.quantity}`).join(" | "),
      (o.subtotal || 0).toFixed(2),
      (o.discount || 0).toFixed(2),
      (o.tax || 0).toFixed(2),
      (o.total || 0).toFixed(2),
      o.createdByName || "-",
      o.customerId || "-",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify(`Exported ${orders.length} orders to CSV`, "success");
  };

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
  const refundedOrders = filteredOrders.filter((o) => o.status === "refunded");
  const voidedOrders = filteredOrders.filter((o) => o.status === "voided");

  const handleActionConfirm = () => {
    if (!actionOrder) return;
    if (actionOrder.type === "void") {
      voidOrder(actionOrder.order.id, reason.trim());
      notify(`Order #${actionOrder.order.id.slice(-4).toUpperCase()} voided; stock restored`, "warning");
    } else {
      refundOrder(actionOrder.order.id, reason.trim());
      notify(`Refund of ${formatCurrency(actionOrder.order.total)} processed`, "success");
    }
    setActionOrder(null);
    setReason("");
  };

  const handlePriority = (orderId, currentPriority) => {
    const newPriority = currentPriority === "rush" ? "normal" : "rush";
    dispatch({ type: "UPDATE_ORDER_PRIORITY", payload: { orderId, priority: newPriority } });
    if (newPriority === "rush") notify("Order marked as RUSH!", "warning");
  };

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
          {["all", "preparing", "ready", "completed", "cancelled", "refunded", "voided"].map((s) => (
            <button
              key={s}
              className={`of-btn ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}
            >
              {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
          <button className="export-btn" onClick={handleExportCSV} title="Export all orders to CSV">
            ⬇️ Export CSV
          </button>
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
          <span className="os-num refunded">{refundedOrders.length + voidedOrders.length}</span>
          <span className="os-label">Refunded & Voided</span>
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
                    <button className={`oc-btn ${order.priority === "rush" ? "unrush" : "rush"}`} onClick={() => handlePriority(order.id, order.priority)}>
                      {order.priority === "rush" ? "Unrush" : "Rush"}
                    </button>
                    {order.status === "preparing" && (
                      <button className="oc-btn ready" onClick={() => handleStatus(order.id, "ready")}>Ready</button>
                    )}
                    {order.status === "ready" && (
                      <button className="oc-btn complete" onClick={() => handleStatus(order.id, "completed")}>Complete</button>
                    )}
                    <button className="oc-btn void" onClick={() => { setReason(""); setActionOrder({ type: "void", order }); }}>Void</button>
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
                    <button className="oc-btn refund" onClick={() => { setReason(""); setActionOrder({ type: "refund", order }); }}>Refund</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(refundedOrders.length > 0 || voidedOrders.length > 0) && (
        <div className="orders-section">
          <h3>↩️ Refunded & Voided ({refundedOrders.length + voidedOrders.length})</h3>
          <div className="orders-grid">
            {[...refundedOrders, ...voidedOrders]
              .sort((a, b) => (b.refundedAt || b.voidedAt || "").localeCompare(a.refundedAt || a.voidedAt || ""))
              .map((order) => (
                <div key={order.id} className={`order-card action-card ${order.status}`}>
                  <div className="oc-header">
                    <div className="oc-id">
                      <span className="oc-hash">#{order.id.slice(-4).toUpperCase()}</span>
                      <span className={`oc-status ${order.status}`}>{order.status}</span>
                    </div>
                    <span className="oc-total">{formatCurrency(order.total)}</span>
                  </div>
                  <div className="oc-action-info">
                    <span title={order.refundReason || order.voidReason}>Reason: {order.refundReason || order.voidReason || "-"}</span>
                    <span>By {order.refundedBy || order.voidedBy} • {formatTime(order.refundedAt || order.voidedAt)}</span>
                  </div>
                  <div className="oc-footer">
                    <div className="oc-meta">
                      <span>🕐 {formatTime(order.createdAt)}</span>
                      <span>👤 {order.createdByName}</span>
                    </div>
                    <div className="oc-actions">
                      <button className="oc-btn receipt" onClick={() => setShowReceipt(order)} title="View receipt">🧾</button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {showReceipt && (
        <Modal isOpen={true} onClose={() => setShowReceipt(null)} title="Receipt Preview" size="sm">
          <ReceiptPreview order={showReceipt} settings={settings} onClose={() => setShowReceipt(null)} />
        </Modal>
      )}

      {actionOrder && (
        <Modal isOpen={true} onClose={() => { setActionOrder(null); setReason(""); }} title={actionOrder.type === "void" ? "Void Order" : "Refund Order"}>
          <div className="action-modal">
            <p className="action-modal-text">
              {actionOrder.type === "void"
                ? `Void order #${actionOrder.order.id.slice(-4).toUpperCase()}? Items will be returned to inventory.`
                : `Issue a refund of ${formatCurrency(actionOrder.order.total)} for order #${actionOrder.order.id.slice(-4).toUpperCase()}?`}
            </p>
            <input
              className="reason-input"
              type="text"
              placeholder="Reason (required)..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              autoFocus
            />
            <div className="action-modal-btns">
              <button className="oc-btn cancel" onClick={() => { setActionOrder(null); setReason(""); }}>Back</button>
              <button className="oc-btn confirm" disabled={!reason.trim()} onClick={handleActionConfirm}>
                {actionOrder.type === "void" ? "Confirm Void" : "Confirm Refund"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
