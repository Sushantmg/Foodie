import { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { expenseCategories, categoryColors } from "../data/expenses";
import { formatCurrency, getToday, formatDate } from "../utils/helpers";
import Modal from "../components/shared/Modal";
import "./Expenses.css";

export default function Expenses() {
  const { expenses, addExpense, deleteExpense, notify } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    category: expenseCategories[0],
    description: "",
    amount: "",
    date: getToday(),
  });

  const today = getToday();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const monthKey = today.slice(0, 7);

  const summary = useMemo(() => {
    const s = { today: 0, week: 0, month: 0, total: 0, count: expenses.length };
    expenses.forEach((e) => {
      const amount = Number(e.amount) || 0;
      s.total += amount;
      if (e.date === today) s.today += amount;
      if (e.date >= weekAgo) s.week += amount;
      if (e.date?.slice(0, 7) === monthKey) s.month += amount;
    });
    return s;
  }, [expenses, today, weekAgo, monthKey]);

  const filtered = useMemo(() => {
    return expenses
      .filter((e) => (filter === "All" ? true : e.category === filter))
      .filter((e) => e.description?.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [expenses, filter, search]);

  const handleSave = () => {
    if (!form.description.trim() || !form.amount || Number(form.amount) <= 0) {
      return notify("Description and amount are required", "error");
    }
    addExpense({
      category: form.category,
      description: form.description.trim(),
      amount: Number(form.amount),
      date: form.date || today,
    });
    notify("Expense added");
    setShowModal(false);
    setForm({ category: expenseCategories[0], description: "", amount: "", date: today });
  };

  return (
    <div className="expenses-page">
      <div className="expenses-header">
        <h2>Expense Tracking</h2>
        <button className="expense-add-btn" onClick={() => setShowModal(true)}>+ Add Expense</button>
      </div>

      <div className="expense-stats">
        <div className="exp-stat"><span className="exp-stat-num">{formatCurrency(summary.today)}</span><span className="exp-stat-label">Today</span></div>
        <div className="exp-stat"><span className="exp-stat-num">{formatCurrency(summary.week)}</span><span className="exp-stat-label">This Week</span></div>
        <div className="exp-stat"><span className="exp-stat-num">{formatCurrency(summary.month)}</span><span className="exp-stat-label">This Month</span></div>
        <div className="exp-stat"><span className="exp-stat-num">{formatCurrency(summary.total)}</span><span className="exp-stat-label">All Time</span></div>
        <div className="exp-stat"><span className="exp-stat-num">{summary.count}</span><span className="exp-stat-label">Entries</span></div>
      </div>

      <div className="expense-controls">
        <input
          type="text"
          placeholder="Search expenses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="expense-search"
        />
        <div className="expense-filters">
          {["All", ...expenseCategories].map((cat) => (
            <button
              key={cat}
              className={`exp-filter ${filter === cat ? "active" : ""}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="expense-table">
        <div className="exp-row exp-header">
          <span className="exp-col desc-col">Description</span>
          <span className="exp-col">Category</span>
          <span className="exp-col">Date</span>
          <span className="exp-col">Amount</span>
          <span className="exp-col">Added By</span>
          <span className="exp-col actions-col">Actions</span>
        </div>
        {filtered.length === 0 ? (
          <div className="exp-empty">
            <span>🧾</span>
            <p>No expenses found</p>
          </div>
        ) : filtered.map((e) => (
          <div key={e.id} className="exp-row">
            <span className="exp-col desc-col">
              <span className="exp-dot" style={{ background: categoryColors[e.category] || "#64748b" }} />
              {e.description}
            </span>
            <span className="exp-col">
              <span className="exp-cat" style={{ background: (categoryColors[e.category] || "#64748b") + "20", color: categoryColors[e.category] || "#64748b" }}>
                {e.category}
              </span>
            </span>
            <span className="exp-col">{formatDate(e.date)}</span>
            <span className="exp-col amount">{formatCurrency(e.amount)}</span>
            <span className="exp-col">{e.addedBy}</span>
            <span className="exp-col">
              <button
                className="exp-delete"
                onClick={() => { deleteExpense(e.id); notify("Expense removed", "warning"); }}
              >
                Delete
              </button>
            </span>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Expense">
        <div className="expense-form">
          <div className="exp-form-group">
            <label>Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {expenseCategories.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="exp-form-group">
            <label>Description</label>
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="e.g. Weekly vegetable supply" />
          </div>
          <div className="exp-form-row">
            <div className="exp-form-group">
              <label>Amount</label>
              <input type="number" min="0" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
            </div>
            <div className="exp-form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <button className="exp-save" onClick={handleSave}>Add Expense</button>
        </div>
      </Modal>
    </div>
  );
}