import { useApp } from "../context/AppContext";
import "./Tables.css";

export default function Tables() {
  const { tables, dispatch, orders, notify } = useApp();

  const getTableOrder = (table) => {
    if (!table.orderId) return null;
    return orders.find((o) => o.id === table.orderId);
  };

  return (
    <div className="tables-page">
      <div className="tables-legend">
        <span className="legend-item"><span className="legend-dot available"></span> Available</span>
        <span className="legend-item"><span className="legend-dot occupied"></span> Occupied</span>
      </div>

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
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
