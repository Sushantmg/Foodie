import { useApp } from "../../context/AppContext";
import "./Notification.css";

export default function Notification() {
  const { notification } = useApp();

  if (!notification) return null;

  return (
    <div className={`notification ${notification.type}`}>
      <span className="notif-icon">
        {notification.type === "success" && "✅"}
        {notification.type === "error" && "❌"}
        {notification.type === "warning" && "⚠️"}
        {notification.type === "info" && "ℹ️"}
      </span>
      <span className="notif-message">{notification.message}</span>
    </div>
  );
}
