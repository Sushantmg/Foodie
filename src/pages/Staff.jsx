import { useState } from "react";
import { useApp } from "../context/AppContext";
import { roleLabels, roleColors } from "../data/users";
import { generateId, formatDate } from "../utils/helpers";
import Modal from "../components/shared/Modal";
import "./Staff.css";

export default function Staff() {
  const { users, dispatch, notify } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "staff", phone: "", avatar: "👤" });

  const avatars = ["👨‍💼", "👩‍💼", "👨‍🍳", "👩‍🍳", "👨‍🔧", "👩‍🔧", "👤"];

  const openAdd = () => {
    setEditUser(null);
    setForm({ name: "", email: "", password: "", role: "staff", phone: "", avatar: "👤" });
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
      notify("Staff updated successfully");
    } else {
      dispatch({ type: "ADD_USER", payload: { id: generateId(), ...form, createdAt: new Date().toISOString().split("T")[0] } });
      notify("Staff added successfully");
    }
    setShowModal(false);
  };

  return (
    <div className="staff-page">
      <div className="staff-header">
        <div className="staff-count">{users.length} team members</div>
        <button className="staff-add-btn" onClick={openAdd}>+ Add Staff</button>
      </div>

      <div className="staff-grid">
        {users.map((user) => (
          <div key={user.id} className="staff-card">
            <div className="staff-avatar">{user.avatar}</div>
            <h3>{user.name}</h3>
            <span className="staff-role" style={{ background: roleColors[user.role] + "20", color: roleColors[user.role] }}>
              {roleLabels[user.role]}
            </span>
            <div className="staff-details">
              <span>📧 {user.email}</span>
              <span>📞 {user.phone}</span>
              <span>📅 Joined {formatDate(user.createdAt)}</span>
            </div>
            <div className="staff-actions">
              <button className="sa-edit" onClick={() => openEdit(user)}>Edit</button>
              {user.id !== "1" && (
                <button className="sa-delete" onClick={() => { dispatch({ type: "DELETE_USER", payload: user.id }); notify("Staff removed", "warning"); }}>Remove</button>
              )}
            </div>
          </div>
        ))}
      </div>

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
