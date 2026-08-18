import { useState } from "react";
import { useApp } from "../context/AppContext";
import "./Login.css";

export default function Login() {
  const { login } = useApp();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const result = login(email, password);
      if (!result.success) {
        setError(result.error);
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <span className="brand-icon">🍽️</span>
            <h1>FoodiePOS</h1>
            <p>Restaurant Management System</p>
          </div>
          <div className="login-features">
            <div className="feature">
              <span>📊</span>
              <div>
                <h4>Real-time Analytics</h4>
                <p>Track sales, orders, and performance</p>
              </div>
            </div>
            <div className="feature">
              <span>👥</span>
              <div>
                <h4>Staff Management</h4>
                <p>Manage roles and permissions</p>
              </div>
            </div>
            <div className="feature">
              <span>📦</span>
              <div>
                <h4>Inventory Control</h4>
                <p>Track stock and ingredients</p>
              </div>
            </div>
            <div className="feature">
              <span>💬</span>
              <div>
                <h4>AI Chatbot</h4>
                <p>24/7 virtual assistant</p>
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Welcome Back</h2>
            <p className="login-subtitle">Sign in to your account</p>

            {error && <div className="login-error">⚠️ {error}</div>}

            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className="demo-accounts">
              <p>Demo Accounts:</p>
              <div className="demo-list">
                <button type="button" onClick={() => { setEmail("admin@foodiepos.com"); setPassword("admin123"); }}>
                  👨‍💼 Admin
                </button>
                <button type="button" onClick={() => { setEmail("manager@foodiepos.com"); setPassword("manager123"); }}>
                  👨‍🍳 Manager
                </button>
                <button type="button" onClick={() => { setEmail("staff@foodiepos.com"); setPassword("staff123"); }}>
                  👩‍🍳 Staff
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
