import { useState } from "react";
import { useApp } from "../context/AppContext";
import { roleLabels, roleColors } from "../data/users";
import { generateId, formatDate } from "../utils/helpers";
import Modal from "../components/shared/Modal";
import "./Staff.css";

const SHIFTS = [
  { id: "morning", label: "Morning", time: "6:00 AM - 2:00 PM", color: "#f59e0b" },
  { id: "afternoon", label: "Afternoon", time: "2:00 PM - 10:00 PM", color: "#6366f1" },
  { id: "off", label: "Off", time: "Day Off", color: "#94a3b8" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Staff() {
  const { users, dispatch, notify } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [activeTab, setActiveTab] = useState("team");
  const [search, setSearch] = useState("");
  const [schedule, setSchedule] = useState(() => {
    const s = {};
    users.forEach((u) => {
      s[u.id] = {};
      DAYS.forEach((day) => {
        s[u.id][day] = SHIFTS[Math.floor(Math.random() * 2)].id;
      });
    });
    return s;
  });
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "staff", phone: "", avatar: "\u{1f464}" });
  const [confirmDelete, setConfirmDelete] = useState(null);

  const avatars = ["\u{1f468}\u200d\u{1f4bc}", "\u{1f469}\u200d\u{1f4bc}", "\u{1f468}\u200d\u{1f373}", "\u{1f469}\u200d\u{1f373}", "\u{1f468}\u200d\u{1f527}", "\u{1f469}\u200d\u{1f527}", "\u{1f464}"];

  const openAdd = () => {
    setEditUser(null);
    setForm({ name: "", email: "", password: "", role: "staff", phone: "", avatar: "\u{1f464}" });
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditUser(user);
    setForm({ name: user.name, email: user.email, password: user.password, role: user.role, phone: user.phone, avatar: user.avatar });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return notify("Name and email are required", "error");
    if (!editUser && !form.password) return notify("Password is required", "error");
    if (editUser) {
      dispatch({ type: "UPDATE_USER", payload: { ...editUser, ...form } });
      notify("Staff updated");
    } else {
      dispatch({ type: "ADD_USER", payload: { id: generateId(), ...form, createdAt: new Date().toISOString().split("T")[0] } });
      notify("Staff added");
    }
    setShowModal(false);
  };

  const handleDelete = (user) => {
    dispatch({ type: "DELETE_USER", payload: user.id });
    notify(user.name + " removed", "warning");
    setConfirmDelete(null);
  };

  const toggleShift = (userId, day) => {
    setSchedule((prev) => {
      const cur = prev[userId]?.[day];
      const idx = SHIFTS.findIndex((s) => s.id === cur);
      return { ...prev, [userId]: { ...prev[userId], [day]: SHIFTS[(idx + 1) % SHIFTS.length].id } };
    });
  };

  const today = DAYS[new Date().getDay() - 1] || "Mon";
  const todayStaff = users.filter((u) => schedule[u.id]?.[today] && schedule[u.id][today] !== "off");
  const filteredUsers = users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="staff-page">
      <div className="staff-tabs">
        <button className={`staff-tab ${activeTab === "team" ? "active" : ""}`} onClick={() => setActiveTab("team")}>
          Team ({users.length})
        </button>
        <button className={`staff-tab ${activeTab === "schedule" ? "active" : ""}`} onClick={() => setActiveTab("schedule")}>
          Schedule
        </button>
        <button className={`staff-tab ${activeTab === "today" ? "active" : ""}`} onClick={() => setActiveTab("today")}>
          On Duty ({todayStaff.length})
        </button>
      </div>

      {activeTab === "team" && (
        <>
          <div className="staff-header">
            <input type="text" placeholder="Search staff..." className="staff-search-input" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="staff-add-btn" onClick={openAdd}>+ Add Staff</button>
          </div>
          <div className="staff-grid">
            {filteredUsers.map((user) => (
              <div key={user.id} className="staff-card">
                <div className="staff-avatar">{user.avatar}</div>
                <h3>{user.name}</h3>
                <span className="staff-role" style={{ background: roleColors[user.role] + "20", color: roleColors[user.role] }}>
                  {roleLabels[user.role]}
                </span>
                <div className="staff-details">
                  <span>{user.email}</span>
                  <span>{user.phone}</span>
                  <span>Joined {formatDate(user.createdAt)}</span>
                </div>
                <div className="staff-actions">
                  <button className="sa-edit" onClick={() => openEdit(user)}>Edit</button>
                  {user.id !== "1" && (
                    <button className="sa-delete" onClick={() => setConfirmDelete(user)}>Remove</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === "schedule" && (
        <div className="schedule-view">
          <div className="schedule-legend">
            {SHIFTS.map((s) => (
              <span key={s.id} className="legend-item">
                <span className="legend-dot" style={{ background: s.color }} />
                {s.label} ({s.time})
              </span>
            ))}
          </div>
          <div className="schedule-table">
            <div className="schedule-header">
              <span className="sch-name-col">Staff Member</span>
              {DAYS.map((day) => (
                <span key={day} className={`sch-day-col ${day === today ? "today" : ""}`}>{day}</span>
              ))}
            </div>
            {users.map((user) => (
              <div key={user.id} className="schedule-row">
                <span className="sch-name-col">
                  <span className="sch-avatar">{user.avatar}</span>
                  {user.name}
                </span>
                {DAYS.map((day) => {
                  const shiftId = schedule[user.id]?.[day];
                  const shift = SHIFTS.find((s) => s.id === shiftId);
                  return (
                    <button
                      key={day}
                      className={`sch-shift-cell ${day === today ? "today" : ""}`}
                      style={{ background: shift?.color + "20", color: shift?.color, borderColor: shift?.color + "40" }}
                      onClick={() => toggleShift(user.id, day)}
                      title={`${shift?.label}: ${shift?.time}`}
                    >
                      {shift?.label?.slice(0, 3)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "today" && (
        <div className="today-view">
          {todayStaff.length === 0 ? (
            <div className="no-staff-today">
              <span style={{ fontSize: 48 }}>No Staff Scheduled Today</span>
              <p>Set up the weekly schedule to see who is on duty</p>
            </div>
          ) : (
            <div className="today-grid">
              {todayStaff.map((user) => {
                const shiftId = schedule[user.id]?.[today];
                const shift = SHIFTS.find((s) => s.id === shiftId);
                return (
                  <div key={user.id} className="today-card" style={{ borderLeftColor: shift?.color }}>
                    <div className="today-card-left">
                      <span className="today-avatar">{user.avatar}</span>
                      <div>
                        <h4>{user.name}</h4>
                        <span className="today-role">{roleLabels[user.role]}</span>
                      </div>
                    </div>
                    <div className="today-card-right">
                      <span className="today-shift" style={{ background: shift?.color + "20", color: shift?.color }}>
                        {shift?.label}
                      </span>
                      <span className="today-time">{shift?.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {confirmDelete && (
        <Modal isOpen={true} onClose={() => setConfirmDelete(null)} title="Confirm Remove">
          <div className="confirm-delete-box">
            <p>Remove <strong>{confirmDelete.name}</strong> from the team?</p>
            <p className="confirm-sub">This action cannot be undone.</p>
            <div className="confirm-actions">
              <button className="confirm-yes" onClick={() => handleDelete(confirmDelete)}>Yes, Remove</button>
              <button className="confirm-no" onClick={() => setConfirmDelete(null)}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editUser ? "Edit Staff" : "Add Staff"}>
        <div className="staff-form">
          <div className="sf-group">
            <label>Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="sf-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="sf-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editUser ? "Leave empty to keep" : ""} />
          </div>
          <div className="sf-row">
            <div className="sf-group">
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="sf-group">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="sf-group">
            <label>Avatar</label>
            <div className="sf-avatars">
              {avatars.map((a) => (
                <button key={a} className={`sf-avatar ${form.avatar === a ? "active" : ""}`} onClick={() => setForm({ ...form, avatar: a })}>{a}</button>
              ))}
            </div>
          </div>
          <button className="sf-save" onClick={handleSave}>{editUser ? "Update" : "Add Staff"}</button>
        </div>
      </Modal>
    </div>
  );
}
