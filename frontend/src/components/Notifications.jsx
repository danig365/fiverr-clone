import React, { useEffect, useState } from "react";
import { getNotifications,markNotificationRead } from "../api/notifications";
import "../styles/Notifications.css";

const POLL_INTERVAL = 10000; // 10 seconds

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="notifications">
      <button className="notif-bell" onClick={() => setOpen(!open)}>
        🔔
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          {notifications.length === 0 ? (
            <p className="notif-empty">No notifications</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`notif-item ${notif.is_read ? "read" : "unread"}`}
                onClick={() => handleMarkRead(notif.id)}
              >
                <p>{notif.message}</p>
                <small>{new Date(notif.created_at).toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
