import { useState } from "react";
import { useApp } from "../context/AppContext";
import { storage } from "../utils/helpers";
import "./Settings.css";

export default function Settings() {
  const { settings, dispatch, notify, currentUser } = useApp();
  const [form, setForm] = useState({ ...settings });
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSave = () => {
    dispatch({ type: "UPDATE_SETTINGS", payload: form });
    notify("Settings saved successfully");
  };

  const handleClearData = () => {
    storage.clear();
    window.location.reload();
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h2>Settings</h2>
        <button className="save-btn" onClick={handleSave}>Save Changes</button>
      </div>

      <div className="settings-grid">
        <div className="settings-section">
          <h3>🏪 Restaurant Info</h3>
          <div className="setting-group">
            <label>Restaurant Name</label>
            <input value={form.restaurantName} onChange={(e) => setForm({ ...form, restaurantName: e.target.value })} />
          </div>
          <div className="setting-group">
            <label>Address</label>
            <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="setting-row">
            <div className="setting-group">
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="setting-group">
              <label>Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="setting-group">
            <label>Website</label>
            <input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
          </div>
        </div>

        <div className="settings-section">
          <h3>💰 Payment</h3>
          <div className="setting-row">
            <div className="setting-group">
              <label>Tax Rate (%)</label>
              <input type="number" step="0.1" value={form.taxRate} onChange={(e) => setForm({ ...form, taxRate: Number(e.target.value) })} />
            </div>
            <div className="setting-group">
              <label>Service Charge (%)</label>
              <input type="number" step="0.1" value={form.serviceCharge} onChange={(e) => setForm({ ...form, serviceCharge: Number(e.target.value) })} />
            </div>
          </div>
          <div className="setting-group">
            <label>Currency Symbol</label>
            <input value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} />
          </div>
        </div>

        <div className="settings-section">
          <h3>📦 Inventory</h3>
          <div className="setting-group">
            <label>Low Stock Threshold</label>
            <input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: Number(e.target.value) })} />
          </div>
        </div>

        <div className="settings-section">
          <h3>💎 Loyalty Program</h3>
          <div className="setting-toggle">
            <label>Enable Loyalty Program</label>
            <button
              className={`toggle ${form.enableLoyalty ? "on" : ""}`}
              onClick={() => setForm({ ...form, enableLoyalty: !form.enableLoyalty })}
            >
              {form.enableLoyalty ? "ON" : "OFF"}
            </button>
          </div>
          <div className="setting-group">
            <label>Points per Dollar</label>
            <input type="number" value={form.pointsPerDollar} onChange={(e) => setForm({ ...form, pointsPerDollar: Number(e.target.value) })} />
          </div>
        </div>

        <div className="settings-section">
          <h3>🧾 Receipt</h3>
          <div className="setting-group">
            <label>Header Message</label>
            <input value={form.receiptHeader} onChange={(e) => setForm({ ...form, receiptHeader: e.target.value })} />
          </div>
          <div className="setting-group">
            <label>Footer Message</label>
            <input value={form.receiptFooter} onChange={(e) => setForm({ ...form, receiptFooter: e.target.value })} />
          </div>
        </div>

        <div className="settings-section">
          <h3>⏰ Opening Hours</h3>
          {Object.entries(form.openingHours).map(([day, hours]) => (
            <div key={day} className="hours-row">
              <span className="hours-day">{day.charAt(0).toUpperCase() + day.slice(1)}</span>
              <div className="hours-toggle">
                <button
                  className={`toggle small ${!hours.closed ? "on" : ""}`}
                  onClick={() => setForm({
                    ...form,
                    openingHours: { ...form.openingHours, [day]: { ...hours, closed: !hours.closed } },
                  })}
                >
                  {hours.closed ? "Closed" : "Open"}
                </button>
              </div>
              {!hours.closed && (
                <div className="hours-times">
                  <input type="time" value={hours.open} onChange={(e) => setForm({
                    ...form, openingHours: { ...form.openingHours, [day]: { ...hours, open: e.target.value } },
                  })} />
                  <span>to</span>
                  <input type="time" value={hours.close} onChange={(e) => setForm({
                    ...form, openingHours: { ...form.openingHours, [day]: { ...hours, close: e.target.value } },
                  })} />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="settings-section">
          <h3>🗄️ Data Management</h3>
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 12 }}>
            Reset all data to defaults. This will clear all orders, menu changes, customers, and settings.
          </p>
          {!showConfirm ? (
            <button
              className="danger-btn"
              onClick={() => setShowConfirm(true)}
            >
              Reset All Data
            </button>
          ) : (
            <div className="confirm-clear">
              <p style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", marginBottom: 8 }}>
                Are you sure? This cannot be undone.
              </p>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="danger-btn" onClick={handleClearData}>
                  Yes, Reset Everything
                </button>
                <button className="cancel-clear" onClick={() => setShowConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
