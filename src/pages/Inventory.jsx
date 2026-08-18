import { useState } from "react";
import { useApp } from "../context/AppContext";
import { formatCurrency } from "../utils/helpers";
import "./Inventory.css";

export default function Inventory() {
  const { menu, dispatch, notify, settings } = useApp();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterStock, setFilterStock] = useState("all");

  const totalStock = menu.reduce((s, m) => s + m.stock, 0);
  const totalValue = menu.reduce((s, m) => s + m.stock * m.cost, 0);
  const lowStock = menu.filter((m) => m.stock <= settings.lowStockThreshold && m.stock > 0);
  const outOfStock = menu.filter((m) => m.stock === 0);

  let filtered = menu.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    if (filterStock === "low") return matchSearch && m.stock <= settings.lowStockThreshold && m.stock > 0;
    if (filterStock === "out") return matchSearch && m.stock === 0;
    if (filterStock === "in") return matchSearch && m.stock > settings.lowStockThreshold;
    return matchSearch;
  });

  filtered.sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "stock") return a.stock - b.stock;
    if (sortBy === "value") return (b.stock * b.cost) - (a.stock * a.cost);
    return 0;
  });

  return (
    <div className="inventory">
      <div className="inv-stats">
        <div className="inv-stat">
          <span className="inv-stat-num">{totalStock}</span>
          <span className="inv-stat-label">Total Units</span>
        </div>
        <div className="inv-stat">
          <span className="inv-stat-num">{formatCurrency(totalValue)}</span>
          <span className="inv-stat-label">Inventory Value</span>
        </div>
        <div className="inv-stat warning">
          <span className="inv-stat-num">{lowStock.length}</span>
          <span className="inv-stat-label">Low Stock</span>
        </div>
        <div className="inv-stat danger">
          <span className="inv-stat-num">{outOfStock.length}</span>
          <span className="inv-stat-label">Out of Stock</span>
        </div>
      </div>

      <div className="inv-controls">
        <input type="text" placeholder="Search inventory..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="name">Sort by Name</option>
          <option value="stock">Sort by Stock</option>
          <option value="value">Sort by Value</option>
        </select>
        <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)}>
          <option value="all">All Items</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
          <option value="in">In Stock</option>
        </select>
      </div>

      <div className="inv-table">
        <div className="inv-row inv-header">
          <span className="inv-col name-col">Item</span>
          <span className="inv-col">Category</span>
          <span className="inv-col">Cost</span>
          <span className="inv-col">Stock</span>
          <span className="inv-col">Value</span>
          <span className="inv-col">Status</span>
          <span className="inv-col">Restock</span>
        </div>
        {filtered.map((item) => (
          <div key={item.id} className="inv-row">
            <span className="inv-col name-col">
              <span className="inv-icon">{item.image}</span>
              {item.name}
            </span>
            <span className="inv-col">{item.category}</span>
            <span className="inv-col">{formatCurrency(item.cost)}</span>
            <span className="inv-col">{item.stock}</span>
            <span className="inv-col">{formatCurrency(item.stock * item.cost)}</span>
            <span className="inv-col">
              <span className={`inv-status ${item.stock === 0 ? "out" : item.stock <= settings.lowStockThreshold ? "low" : "ok"}`}>
                {item.stock === 0 ? "Out" : item.stock <= settings.lowStockThreshold ? "Low" : "Good"}
              </span>
            </span>
            <span className="inv-col">
              <div className="restock-controls">
                <button onClick={() => {
                  dispatch({ type: "UPDATE_MENU_ITEM", payload: { ...item, stock: Math.max(0, item.stock - 10) } });
                }}>-</button>
                <button className="restock-btn" onClick={() => {
                  dispatch({ type: "UPDATE_MENU_ITEM", payload: { ...item, stock: item.stock + 50 } });
                  notify(`${item.name} restocked +50`);
                }}>+50</button>
              </div>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
