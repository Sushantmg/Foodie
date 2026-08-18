import { useState } from "react";
import { useApp } from "../context/AppContext";
import { categories } from "../data/menuData";
import { formatCurrency, generateId } from "../utils/helpers";
import Modal from "../components/shared/Modal";
import "./MenuMgmt.css";

export default function MenuMgmt() {
  const { menu, dispatch, notify, isManager } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [filter, setFilter] = useState("All");
  const [form, setForm] = useState({ name: "", category: "Appetizers", price: "", cost: "", image: "🍽️", description: "", stock: "", prepTime: "" });

  const emojis = ["🥗", "🍞", "🍲", "🍗", "🥟", "🐟", "🥩", "🍝", "🍔", "🍖", "🍄", "🍰", "🍫", "🧁", "🍨", "🥤", "🍋", "☕", "🧊", "🍷", "💧", "🥭", "🍽️"];

  const filtered = filter === "All" ? menu : menu.filter((m) => m.category === filter);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: "", category: "Appetizers", price: "", cost: "", image: "🍽️", description: "", stock: "", prepTime: "" });
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, category: item.category, price: item.price, cost: item.cost, image: item.image, description: item.description, stock: item.stock, prepTime: item.prepTime });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price) return notify("Name and price are required", "error");

    if (editItem) {
      dispatch({ type: "UPDATE_MENU_ITEM", payload: { ...editItem, ...form, price: Number(form.price), cost: Number(form.cost), stock: Number(form.stock), prepTime: Number(form.prepTime) } });
      notify("Item updated successfully");
    } else {
      dispatch({ type: "ADD_MENU_ITEM", payload: { id: generateId(), ...form, price: Number(form.price), cost: Number(form.cost), stock: Number(form.stock), prepTime: Number(form.prepTime), available: true } });
      notify("Item added successfully");
    }
    setShowModal(false);
  };

  const toggleAvailable = (item) => {
    dispatch({ type: "UPDATE_MENU_ITEM", payload: { ...item, available: !item.available } });
  };

  return (
    <div className="menu-mgmt">
      <div className="mm-header">
        <div className="mm-filters">
          {["All", ...categories.slice(1)].map((cat) => (
            <button key={cat} className={`mm-filter ${filter === cat ? "active" : ""}`} onClick={() => setFilter(cat)}>{cat}</button>
          ))}
        </div>
        {isManager && <button className="mm-add-btn" onClick={openAdd}>+ Add Item</button>}
      </div>

      <div className="mm-table">
        <div className="mm-table-header">
          <span className="mm-col item-col">Item</span>
          <span className="mm-col">Category</span>
          <span className="mm-col">Price</span>
          <span className="mm-col">Cost</span>
          <span className="mm-col">Stock</span>
          <span className="mm-col">Status</span>
          {isManager && <span className="mm-col">Actions</span>}
        </div>
        {filtered.map((item) => (
          <div key={item.id} className="mm-table-row">
            <span className="mm-col item-col">
              <span className="mm-item-icon">{item.image}</span>
              <div>
                <span className="mm-item-name">{item.name}</span>
                <span className="mm-item-desc">{item.description}</span>
              </div>
            </span>
            <span className="mm-col">{item.category}</span>
            <span className="mm-col">{formatCurrency(item.price)}</span>
            <span className="mm-col">{formatCurrency(item.cost)}</span>
            <span className="mm-col">
              <span className={`mm-stock ${item.stock <= 10 ? (item.stock === 0 ? "out" : "low") : ""}`}>
                {item.stock}
              </span>
            </span>
            <span className="mm-col">
              <button className={`mm-toggle ${item.available ? "on" : "off"}`} onClick={() => toggleAvailable(item)}>
                {item.available ? "Active" : "Inactive"}
              </button>
            </span>
            {isManager && (
              <span className="mm-col actions">
                <button className="mm-edit" onClick={() => openEdit(item)}>Edit</button>
                <button className="mm-delete" onClick={() => { dispatch({ type: "DELETE_MENU_ITEM", payload: item.id }); notify("Item deleted", "warning"); }}>Delete</button>
              </span>
            )}
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? "Edit Item" : "Add Item"} size="md">
        <div className="mm-form">
          <div className="mm-form-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Item name" />
          </div>
          <div className="mm-form-row">
            <div className="mm-form-group">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {categories.slice(1).map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="mm-form-group">
              <label>Price ($)</label>
              <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>
          <div className="mm-form-row">
            <div className="mm-form-group">
              <label>Cost ($)</label>
              <input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: e.target.value })} />
            </div>
            <div className="mm-form-group">
              <label>Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
          </div>
          <div className="mm-form-group">
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Item description" />
          </div>
          <div className="mm-form-group">
            <label>Icon</label>
            <div className="emoji-picker">
              {emojis.map((e) => (
                <button key={e} className={`emoji-btn ${form.image === e ? "active" : ""}`} onClick={() => setForm({ ...form, image: e })}>{e}</button>
              ))}
            </div>
          </div>
          <button className="mm-save-btn" onClick={handleSave}>{editItem ? "Update" : "Add Item"}</button>
        </div>
      </Modal>
    </div>
  );
}
