import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unknown error" };
  }

  componentDidCatch(error, info) {
    console.error("App crashed:", error, info);
  }

  resetData = () => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("foodiepos_"))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.wrap}>
          <div style={styles.card}>
            <span style={styles.icon}>⚠️</span>
            <h1 style={styles.title}>Something went wrong</h1>
            <p style={styles.desc}>
              The app hit an unexpected error. This is usually caused by old
              saved data in your browser. Clearing it will restore the app.
            </p>
            {this.state.message && <code style={styles.code}>{this.state.message}</code>}
            <button style={styles.btn} onClick={this.resetData}>
              Clear saved data & reload
            </button>
            <button style={styles.btnSecondary} onClick={() => window.location.reload()}>
              Just reload
            </button>
            <p style={styles.hint}>Resets menu edits, orders, staff, and settings in this browser.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const styles = {
  wrap: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f8fafc",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "24px",
  },
  card: {
    background: "white",
    borderRadius: "20px",
    padding: "40px",
    maxWidth: "440px",
    textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
  },
  icon: { fontSize: "48px", display: "block", marginBottom: "12px" },
  title: { fontSize: "22px", fontWeight: 800, margin: "0 0 10px", color: "#1a1a2e" },
  desc: { fontSize: "14px", color: "#64748b", lineHeight: 1.6, margin: "0 0 16px" },
  code: {
    display: "block",
    fontSize: "12px",
    color: "#dc2626",
    background: "#fef2f2",
    padding: "8px 12px",
    borderRadius: "8px",
    marginBottom: "16px",
    wordBreak: "break-word",
  },
  btn: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    color: "white",
    fontSize: "16px",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: "10px",
  },
  btnSecondary: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "12px",
    background: "#f1f5f9",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    marginBottom: "14px",
  },
  hint: { fontSize: "11px", color: "#94a3b8", margin: 0 },
};