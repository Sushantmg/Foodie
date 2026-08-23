import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import "./Tables.css";

function TableTimer({ createdAt }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const calc = () => Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
    setElapsed(calc());
    const interval = setInterval(() => setElapsed(calc()), 1000);
    return () => clearInterval(interval);
  }, [createdAt]);

  const mins = Math.floor(elapsed / 60);
  const isLong = mins > 30;

  return (
    <span className={`table-timer ${isLong ? "long" : ""}`}>
      {mins}m occupied
    </span>
  );
}

export default function Tables() {
  const { tables, dispatch, orders, notify } = useApp();
  const [view, setView] = useState("grid");

  const getTableOrder = (table) => {
    if (!table.orderId) return null;
    return orders.find((o) => o.id === table.orderId);
  };

  const occupiedCount = tables.filter((t) => t.status === "occupied").length;
  const availableCount = tables.filter((t) => t.status === "available").length;

  return (
    <div className="tables-page">
      <div className="tables-top">
        <div className="tables-stats-mini">
          <span className="ts-item available"><strong>{availableCount}</strong> Available</span>
          <span className="ts-item occupied"><strong>{occupiedCount}</strong> Occupied</span>
          <span className="ts-item"><strong>{tables.length}</strong> Total</span>
        </div>
        <div className="tables-legend">
          <span className="legend-item"><span className="legend-dot available"></span> Available</span>
          <span className="legend-item"><span className="legend-dot occupied"></span> Occupied</span>
          <button className={`view-toggle ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}>Grid</button>
          <button className={`view-toggle ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>List</button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="tables-grid">
          {tables.map((table) => {
            const order = getTableOrder(table);
            return (
              <div key={table.id} className={`table-card ${table.status}`} onClick={() => {
                if (table.status === "occupied") {
                  dispatch({ type: "SET_ACTIVE_TAB", payload: "orders" });
                } else {
                  dispatch({ type: "SET_TABLE", payload: table.number });
                  dispatch({ type: "SET_ACTIVE_TAB", payload: "pos" });
                  notify(`Switched to Table ${table.number}`, "info");
                }
              }}>
                <div className="table-icon">{table.status === "available" ? "🪑" : "🍽️"}</div>
                <span className="table-number">T{table.number}</span>
                <span className={`table-status ${table.status}`}>{table.status}</span>
                {order && (
                  <div className="table-order-info">
                    <span>#{order.id.slice(-4).toUpperCase()}</span>
                    <span>${order.total.toFixed(2)}</span>
                    <TableTimer createdAt={order.createdAt} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="tables-list">
          <div className="tl-header">
            <span className="tl-col">Table</span>
            <span className="tl-col">Status</span>
            <span className="tl-col">Order</span>
            <span className="tl-col">Total</span>
            <span className="tl-col">Duration</span>
            <span className="tl-col">Action</span>
          </div>
          {tables.map((table) => {
            const order = getTableOrder(table);
            return (
              <div key={table.id} className={`tl-row ${table.status}`}>
                <span className="tl-col tl-num">T{table.number}</span>
                <span className="tl-col">
                  <span className={`table-status ${table.status}`}>{table.status}</span>
                </span>
                <span className="tl-col">{order ? "#" + order.id.slice(-4).toUpperCase() : "—"}</span>
                <span className="tl-col">{order ? "$" + order.total.toFixed(2) : "—"}</span>
                <span className="tl-col">{order ? <TableTimer createdAt={order.createdAt} /> : "—"}</span>
                <span className="tl-col">
                  {table.status === "available" ? (
                    <button className="tl-action go" onClick={() => {
                      dispatch({ type: "SET_TABLE", payload: table.number });
                      dispatch({ type: "SET_ACTIVE_TAB", payload: "pos" });
                    }}>Open POS</button>
                  ) : (
                    <button className="tl-action view" onClick={() => {
                      dispatch({ type: "SET_ACTIVE_TAB", payload: "orders" });
                    }}>View Order</button>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
