import { useNavigate } from "react-router-dom";
import { logout } from "../../services/apiClient";

import "./layout.css";

function Header({ user }) {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();          
    } finally {
      navigate("/login", { replace: true });
    }
  }

  return (
    <header className="app-header">
      <div className="logo">HR System</div>
      <div className="header-right">
        <div className="user-info">
          <span>{user?.fullName ?? user?.userName ?? "—"}</span>
          <span className="role-label">
            {user?.roles[0] === "HR"  ? " | HR" : " | Employee"}
          </span>
        </div>
        <button type="button" className="logout-link" onClick={handleLogout}>
          Sair
        </button>
      </div>
       </header>
  );
}

export default Header;
