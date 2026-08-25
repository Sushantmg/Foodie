import { useState } from "react";
import { useApp } from "../context/AppContext";
import { loyaltyTiers } from "../data/customers";
import { formatCurrency, generateId } from "../utils/helpers";
import Modal from "../components/shared/Modal";
import "./Customers.css";

export default function Customers() {
  const { customers, dispatch, notify } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editCust, setEditCust] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? customers : customers.filter((c) => c.tier === filter);
  const totalSpent = customers.reduce((s, c) => s + c.totalSpent, 0);

  const openAdd = () => {
    setEditCust(null);
    setForm({ name: "", phone: "", email: "" });
    setShowModal(true);
  };

  const openEdit = (c) => {
    setEditCust(c);
    setForm({ name: c.name, phone: c.phone, email: c.email });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name) return notify("Name is required", "error");
    if (editCust) {
      dispatch({ type: "UPDATE_CUSTOMER", payload: { ...editCust, ...form } });
      notify("Customer updated");
    } else {
      dispatch({ type: "ADD_CUSTOMER", payload: { id: generateId(), ...form, loyaltyPoints: 0, totalSpent: 0, visits: 0, createdAt: new Date().toISOString().split("T")[0], tier: "bronze" } });
      notify("Customer added");
    }
    setShowModal(false);
  };

  return (
    <div className="customers-page">
      <div className="cust-stats">
        <div className="cs-card">
          <span className="cs-num">{customers.length}</span>
          <span className="cs-label">Total Customers</span>
        </div>
        <div className="cs-card">
          <span className="cs-num">{formatCurrency(totalSpent)}</span>
          <span className="cs-label">Total Revenue</span>
        </div>
        {Object.entries(loyaltyTiers).map(([key, tier]) => (
          <div key={key} className="cs-card" style={{ borderLeft: `3px solid ${tier.color}` }}>
            <span className="cs-num">{customers.filter((c) => c.tier === key).length}</span>
            <span className="cs-label">{tier.name}</span>
          </div>
        ))}
      </div>

      <div className="cust-header">
        <div className="cust-filters">
          {["all", ...Object.keys(loyaltyTiers)].map((f) => (
            <button key={f} className={`cf-btn ${filter === f ? "active" : ""}`} onClick={() => setFilter(f)}>
              {f === "all" ? "All" : loyaltyTiers[f].name}
            </button>
          ))}
        </div>
        <button className="cust-add-btn" onClick={openAdd}>+ Add Customer</button>
      </div>

      <div className="cust-table">
        <div className="ct-row ct-header">
          <span className="ct-col name-col">Customer</span>
          <span className="ct-col">Phone</span>
          <span className="ct-col">Visits</span>
          <span className="ct-col">Spent</span>
          <span className="ct-col">Points</span>
          <span className="ct-col">Tier</span>
          <span className="ct-col">Actions</span>
        </div>
        {filtered.map((c) => (
          <div key={c.id} className="ct-row">
            <span className="ct-col name-col">
              <div>
                <span className="ct-name">{c.name}</span>
                <span className="ct-email">{c.email}</span>
              </div>
            </span>
            <span className="ct-col">{c.phone}</span>
            <span className="ct-col">{c.visits}</span>
            <span className="ct-col">{formatCurrency(c.totalSpent)}</span>
            <span className="ct-col">{c.loyaltyPoints} pts</span>
            <span className="ct-col">
              <span className="ct-tier" style={{ background: loyaltyTiers[c.tier].color + "20", color: loyaltyTiers[c.tier].color === "#e5e4e2" ? "#666" : loyaltyTiers[c.tier].color }}>
                {loyaltyTiers[c.tier].name}
              </span>
            </span>
            <span className="ct-col actions">
              <button className="ct-edit" onClick={() => openEdit(c)}>Edit</button>
              <button className="ct-delete" onClick={() => { dispatch({ type: "DELETE_CUSTOMER", payload: c.id }); notify("Customer removed", "warning"); }}>Delete</button>
            </span>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCust ? "Edit Customer" : "Add Customer"}>
        <div className="cust-form">
          <div className="cf-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="cf-group">
            <label>Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="cf-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <button className="cf-save" onClick={handleSave}>{editCust ? "Update" : "Add Customer"}</button>
        </div>
      </Modal>
    </div>
  );
}
