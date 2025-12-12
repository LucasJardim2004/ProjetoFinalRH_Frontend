import { Link } from "react-router-dom";

function Header({ role }) {
  return (
    <header className="app-header">
      <div className="logo">HR System</div>
      <div className="header-right">
        <div className="user-info">
          <span>Utilizador Demo</span>
          <span className="role-label">
            {role === "funcionario" ? "Funcionário" : "Recursos Humanos"}
          </span>
        </div>
        <Link to="/login" className="logout-link">
          Sair
        </Link>
      </div>
    </header>
  );
}

export default Header;