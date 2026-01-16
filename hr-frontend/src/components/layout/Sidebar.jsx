import { NavLink } from "react-router-dom";

import "./layout.css";

function Sidebar({ user, loading }) {
  if (loading) return null;

  const roles = Array.isArray(user?.roles) ? user.roles : [];

  if (roles[0] !== "HR") return null;

  return (
    <aside className="app-sidebar">
      <nav>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/rh/listaFuncionarios">Employees List</NavLink>
        <NavLink to="/Vagas">Job Openings</NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;
