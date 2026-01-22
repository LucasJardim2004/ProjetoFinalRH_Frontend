import { useNavigate } from "react-router-dom";
import { logout, getUnreadNotifications, markNotificationAsRead, deleteNotification } from "../../services/apiClient";
import { useState, useEffect } from "react";

import "./layout.css";

function Header({ user }) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const roles = Array.isArray(user?.roles) ? user.roles : [];

  if (roles[0] !== "HR" && roles[0] !== "Employee") return null;

  // Load notifications on mount
  useEffect(() => {
    if (user?.businessEntityID) {
      getUnreadNotifications(user.businessEntityID)
        .then((data) => {
          setNotifications(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          console.warn("[Header] Failed to fetch notifications on mount:", err);
          setNotifications([]);
        });
    }
  }, [user?.businessEntityID]);

  // Fetch notifications when dropdown opens and mark as read
  useEffect(() => {
    if (showNotifications && user?.businessEntityID) {
      setLoadingNotifications(true);
      getUnreadNotifications(user.businessEntityID)
        .then((data) => {
          const notifList = Array.isArray(data) ? data : [];
          setNotifications(notifList);

          // Mark all unread notifications as read
          const unreadNotifs = notifList.filter((n) => !n.isRead);
          Promise.all(
            unreadNotifs.map((notif) =>
              markNotificationAsRead(notif.notificationID).catch((err) => {
                console.warn(`[Header] Failed to mark notification ${notif.notificationID} as read:`, err);
              })
            )
          ).then(() => {
            // Update state to reflect that notifications are now read
            setNotifications((prev) =>
              prev.map((n) =>
                unreadNotifs.some((u) => u.notificationID === n.notificationID)
                  ? { ...n, isRead: true }
                  : n
              )
            );
          });
        })
        .catch((err) => {
          console.warn("[Header] Failed to fetch notifications:", err);
          setNotifications([]);
        })
        .finally(() => {
          setLoadingNotifications(false);
        });
    }
  }, [showNotifications, user?.businessEntityID]);

  async function handleLogout() {
    try {
      await logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="app-header">
      <div className="logo">Company System</div>
      <div className="header-right">
        <div className="user-info">
          <span>{user?.fullName ?? user?.userName ?? "—"}</span>
          <span className="role-label">
            {user?.roles[0] === "HR" ? " | HR" : " | Employee"}
          </span>
        </div>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="notifications-btn modern-btn"
            aria-label="Notifications"
            title="Notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ position: "relative" }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z"
                fill="currentColor"
              />
            </svg>
            {notifications.filter((n) => !n.isRead).length > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  background: "#ff4444",
                  color: "#fff",
                  borderRadius: "50%",
                  width: 20,
                  height: 20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: "bold",
                  border: "2px solid #fff",
                }}
              >
                {notifications.filter((n) => !n.isRead).length}
              </div>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: 8,
                width: 320,
                background: "#fff",
                border: "1px solid #ddd",
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                zIndex: 1000,
                maxHeight: 400,
                overflowY: "auto",
              }}
            >
              <div style={{ padding: 12 }}>
                {loadingNotifications ? (
                  <p style={{ margin: 0, color: "#999", textAlign: "center", fontSize: 14 }}>
                    Loading...
                  </p>
                ) : notifications.length === 0 ? (
                  <p style={{ margin: 0, color: "#999", textAlign: "center", fontSize: 14 }}>
                    No notifications
                  </p>
                ) : (
                  <div>
                    {notifications.map((notif) => (
                      <div
                        key={notif.notificationID}
                        style={{
                          padding: 10,
                          borderBottom: "1px solid #eee",
                          fontSize: 13,
                          lineHeight: 1.4,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 8,
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: "0 0 4px 0", color: "#333" }}>
                            {notif.fieldName} was changed
                          </p>
                          <p style={{ margin: 0, color: "#999", fontSize: 12 }}>
                            {notif.oldValue} → {notif.newValue}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            deleteNotification(notif.notificationID)
                              .then(() => {
                                setNotifications((prev) =>
                                  prev.filter((n) => n.notificationID !== notif.notificationID)
                                );
                              })
                              .catch((err) => {
                                console.warn("[Header] Failed to delete notification:", err);
                              });
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#999",
                            cursor: "pointer",
                            fontSize: 18,
                            padding: 0,
                            width: 20,
                            height: 20,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            transition: "color 0.2s",
                          }}
                          onMouseEnter={(e) => (e.target.style.color = "#333")}
                          onMouseLeave={(e) => (e.target.style.color = "#999")}
                          title="Delete notification"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <button type="button" className="logout-link" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
