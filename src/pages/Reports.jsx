import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency, formatDate } from "../utils/helpers";
import "./Reports.css";

export default function Reports() {
  const { orders, menu, customers } = useApp();
  const [dateRange, setDateRange] = useState("today");

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const getFilteredOrders = () => {
    if (dateRange === "today") return orders.filter((o) => o.createdAt?.startsWith(today));
    if (dateRange === "week") {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      return orders.filter((o) => o.createdAt >= weekAgo);
    }
    if (dateRange === "month") {
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
      return orders.filter((o) => o.createdAt >= monthAgo);
    }
    return orders;
  };

  const filtered = getFilteredOrders();
  const completedOrders = filtered.filter((o) => o.status === "completed");
  const revenue = filtered.reduce((s, o) => s + o.total, 0);
  const cost = filtered.reduce((s, o) => s + o.items.reduce((si, item) => si + (item.cost || 0) * item.quantity, 0), 0);
  const profit = revenue - cost;
  const avgOrder = filtered.length ? revenue / filtered.length : 0;
  const totalTax = filtered.reduce((s, o) => s + (o.tax || 0), 0);

  const paymentBreakdown = {};
  filtered.forEach((o) => {
    const pm = o.paymentMethod || "cash";
    if (!paymentBreakdown[pm]) paymentBreakdown[pm] = 0;
    paymentBreakdown[pm] += o.total;
  });

  const orderTypeBreakdown = {};
  filtered.forEach((o) => {
    if (!orderTypeBreakdown[o.type]) orderTypeBreakdown[o.type] = { count: 0, revenue: 0 };
    orderTypeBreakdown[o.type].count++;
    orderTypeBreakdown[o.type].revenue += o.total;
  });

  const itemSales = {};
  filtered.forEach((o) => {
    o.items.forEach((item) => {
      if (!itemSales[item.name]) itemSales[item.name] = { count: 0, revenue: 0, image: item.image, cost: 0 };
      itemSales[item.name].count += item.quantity;
      itemSales[item.name].revenue += item.price * item.quantity;
      itemSales[item.name].cost += (item.cost || 0) * item.quantity;
    });
  });
  const topItems = Object.entries(itemSales).sort((a, b) => b[1].revenue - a[1].revenue);

  const hourlySales = Array(24).fill(0);
  filtered.forEach((o) => {
    const hour = new Date(o.createdAt).getHours();
    hourlySales[hour] += o.total;
  });
  const peakHour = hourlySales.indexOf(Math.max(...hourlySales));

  const dailySales = {};
  filtered.forEach((o) => {
    const day = o.createdAt?.split("T")[0];
    if (!dailySales[day]) dailySales[day] = 0;
    dailySales[day] += o.total;
  });

  const exportCSV = () => {
    const headers = "Order ID,Date,Type,Table,Items,Subtotal,Tax,Total,Payment,Status\n";
    const rows = filtered.map((o) =>
      `${o.id.slice(-4)},${o.createdAt?.split("T")[0]},${o.type},${o.table || ""},${o.items.length},${o.subtotal?.toFixed(2)},${o.tax?.toFixed(2)},${o.total.toFixed(2)},${o.paymentMethod},${o.status}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${dateRange}.csv`;
    a.click();
  };

  return (
    <div className="reports">
      <div className="reports-header">
        <h2>Reports & Analytics</h2>
        <div className="reports-controls">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="all">All Time</option>
          </select>
          <button className="export-btn" onClick={exportCSV}>📥 Export CSV</button>
        </div>
      </div>

      <div className="report-cards">
        <div className="rc-card"><span className="rc-icon">💰</span><div><span className="rc-value">{formatCurrency(revenue)}</span><span className="rc-label">Revenue</span></div></div>
        <div className="rc-card"><span className="rc-icon">📈</span><div><span className="rc-value">{formatCurrency(profit)}</span><span className="rc-label">Profit</span></div></div>
        <div className="rc-card"><span className="rc-icon">📋</span><div><span className="rc-value">{filtered.length}</span><span className="rc-label">Total Orders</span></div></div>
        <div className="rc-card"><span className="rc-icon">🎯</span><div><span className="rc-value">{formatCurrency(avgOrder)}</span><span className="rc-label">Avg Order</span></div></div>
        <div className="rc-card"><span className="rc-icon">📊</span><div><span className="rc-value">{formatCurrency(totalTax)}</span><span className="rc-label">Tax Collected</span></div></div>
        <div className="rc-card"><span className="rc-icon">⏰</span><div><span className="rc-value">{peakHour}:00</span><span className="rc-label">Peak Hour</span></div></div>
      </div>

      <div className="report-grid">
        <div className="report-section">
          <h3>🏆 Top Selling Items</h3>
          <div className="top-items-list">
            {topItems.slice(0, 8).map(([name, data], idx) => (
              <div key={name} className="ti-item">
                <span className="ti-rank">#{idx + 1}</span>
                <span className="ti-icon">{data.image}</span>
                <div className="ti-info">
                  <span className="ti-name">{name}</span>
                  <span className="ti-profit">Profit: {formatCurrency(data.revenue - data.cost)}</span>
                </div>
                <div className="ti-stats">
                  <span>{data.count} sold</span>
                  <span className="ti-rev">{formatCurrency(data.revenue)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h3>💳 Payment Breakdown</h3>
          <div className="payment-list">
            {Object.entries(paymentBreakdown).map(([method, amount]) => (
              <div key={method} className="pay-item">
                <span>{method === "cash" ? "💵" : method === "card" ? "💳" : "📱"} {method.toUpperCase()}</span>
                <div className="pay-bar-bg">
                  <div className="pay-bar" style={{ width: `${(amount / revenue) * 100}%` }} />
                </div>
                <span className="pay-amount">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-section">
          <h3>📦 Order Types</h3>
          {Object.entries(orderTypeBreakdown).map(([type, data]) => (
            <div key={type} className="ot-item">
              <span className="ot-type">{type === "dine-in" ? "🍽️ Dine-In" : type === "takeaway" ? "📦 Takeaway" : "🚗 Delivery"}</span>
              <span>{data.count} orders</span>
              <span className="ot-rev">{formatCurrency(data.revenue)}</span>
            </div>
          ))}
        </div>

        <div className="report-section">
          <h3>⏰ Hourly Distribution</h3>
          <div className="hourly-bars">
            {hourlySales.slice(8, 23).map((sale, i) => (
              <div key={i} className="hb-col">
                <div className="hb-bar-container">
                  <div className="hb-bar" style={{ height: `${(sale / Math.max(...hourlySales, 1)) * 100}%` }} />
                </div>
                <span className="hb-label">{i + 8}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
