import { useState, useEffect, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency, formatTime } from "../utils/helpers";
import { playOrderReady, playNotification } from "../utils/sounds";
import "./KDS.css";

function KDSTimer({ createdAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calc = () => Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
    setElapsed(calc());
    const interval = setInterval(() => setElapsed(calc()), 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const urgency = mins > 15 ? "critical" : mins > 10 ? "warning" : "normal";

  return (
    <span className={`kds-timer ${urgency}`}>
      {mins}:{secs.toString().padStart(2, "0")}
    </span>
  );
}

export default function KDS() {
  const { orders, dispatch, notify, settings } = useApp();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const activeOrders = useMemo(() =>
    orders
      .filter((o) => o.status === "preparing" || o.status === "ready")
      .sort((a, b) => {
        if (a.priority === "rush" && b.priority !== "rush") return -1;
        if (b.priority === "rush" && a.priority !== "rush") return 1;
        return new Date(a.createdAt) - new Date(b.createdAt);
      }),
    [orders]
  );

  const preparingOrders = activeOrders.filter((o) => o.status === "preparing");
  const readyOrders = activeOrders.filter((o) => o.status === "ready");

  const handleStatus = (orderId, status) => {
    dispatch({ type: "UPDATE_ORDER_STATUS", payload: { orderId, status } });
    if (status === "ready" && soundEnabled) playOrderReady();
    else playNotification();
  };

  const handlePriority = (orderId, currentPriority) => {
    const newPriority = currentPriority === "rush" ? "normal" : "rush";
    dispatch({ type: "UPDATE_ORDER_PRIORITY", payload: { orderId, priority: newPriority } });
    if (newPriority === "rush") notify("Order marked as RUSH!", "warning");
  };

  const averageWait = preparingOrders.length > 0
    ? Math.round(preparingOrders.reduce((sum, o) => sum + (Date.now() - new Date(o.createdAt).getTime()) / 60000, 0) / preparingOrders.length)
    : 0;

  return (
    <div className="kds-page">
      <div className="kds-topbar">
        <div className="kds-info">
          <h2>Kitchen Display</h2>
          <div className="kds-stats">
            <span className="kds-stat preparing"><strong>{preparingOrders.length}</strong> Preparing</span>
            <span className="kds-stat ready"><strong>{readyOrders.length}</strong> Ready</span>
            <span className="kds-stat avg">Avg Wait: <strong>{averageWait}m</strong></span>
          </div>
        </div>
        <div className="kds-controls">
          <button className={`kds-toggle ${soundEnabled ? "on" : ""}`} onClick={() => setSoundEnabled(!soundEnabled)}>
            {soundEnabled ? "Sound ON" : "Sound OFF"}
          </button>
          <button className={`kds-toggle ${autoRefresh ? "on" : ""}`} onClick={() => setAutoRefresh(!autoRefresh)}>
            {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
          </button>
        </div>
      </div>

      <div className="kds-columns">
        <div className="kds-column">
          <div className="kds-col-header preparing-header">
            <span className="kds-col-icon">🔥</span>
            <h3>PREPARING ({preparingOrders.length})</h3>
          </div>
          <div className="kds-cards">
            {preparingOrders.length === 0 ? (
              <div className="kds-empty">No orders to prepare</div>
            ) : (
              preparingOrders.map((order) => (
                <div key={order.id} className={`kds-card ${order.status} ${order.priority === "rush" ? "rush" : ""}`}>
                  <div className="kds-card-top">
                    <div className="kds-card-id">
                      <span className="kds-hash">#{order.id.slice(-4).toUpperCase()}</span>
                      {order.priority === "rush" && <span className="kds-rush-badge">RUSH</span>}
                    </div>
                    <KDSTimer createdAt={order.createdAt} />
                  </div>
                  <div className="kds-card-type">
                    {order.type === "dine-in" ? `Table ${order.table}` : order.type === "takeaway" ? "Takeaway" : "Delivery"}
                    {order.notes && <span className="kds-note">Note: {order.notes}</span>}
                  </div>
                  <div className="kds-card-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="kds-item">
                        <span className="kds-item-qty">{item.quantity}x</span>
                        <span className="kds-item-name">{item.image} {item.name}</span>
                        {item.modifiers && item.modifiers.length > 0 && (
                          <div className="kds-item-mods">
                            {item.modifiers.map((m, mi) => (
                              <span key={mi} className="kds-mod">+ {m.name}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="kds-card-actions">
                    <button className="kds-btn priority" onClick={() => handlePriority(order.id, order.priority)}>
                      {order.priority === "rush" ? "Unrush" : "Rush"}
                    </button>
                    <button className="kds-btn ready-btn" onClick={() => handleStatus(order.id, "ready")}>
                      Mark Ready
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="kds-column">
          <div className="kds-col-header ready-header">
            <span className="kds-col-icon">✅</span>
            <h3>READY ({readyOrders.length})</h3>
          </div>
          <div className="kds-cards">
            {readyOrders.length === 0 ? (
              <div className="kds-empty">No orders ready</div>
            ) : (
              readyOrders.map((order) => (
                <div key={order.id} className="kds-card ready">
                  <div className="kds-card-top">
                    <div className="kds-card-id">
                      <span className="kds-hash">#{order.id.slice(-4).toUpperCase()}</span>
                    </div>
                    <KDSTimer createdAt={order.createdAt} />
                  </div>
                  <div className="kds-card-type">
                    {order.type === "dine-in" ? `Table ${order.table}` : order.type === "takeaway" ? "Takeaway" : "Delivery"}
                  </div>
                  <div className="kds-card-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="kds-item">
                        <span className="kds-item-qty">{item.quantity}x</span>
                        <span className="kds-item-name">{item.image} {item.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="kds-card-actions">
                    <button className="kds-btn complete-btn" onClick={() => handleStatus(order.id, "completed")}>
                      Complete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
