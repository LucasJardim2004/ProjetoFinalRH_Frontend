import { useNavigate } from "react-router-dom";
import { logout } from "../../services/apiClient";

import "./layout.css";

function Header({ user }) {
  const navigate = useNavigate();

  const roles = Array.isArray(user?.roles) ? user.roles : [];

  if (roles[0] !== "HR" && roles[0] !== "Employee") return null;

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

        <button
          type="button"
          className="notifications-btn modern-btn"
          aria-label="Notifications"
          title="Notifications"
          onClick={() => {}}
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
        </button>

        <button type="button" className="logout-link" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
