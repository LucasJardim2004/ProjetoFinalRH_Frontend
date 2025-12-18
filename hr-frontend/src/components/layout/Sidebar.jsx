
// Sidebar.jsx
import { NavLink } from "react-router-dom";

function Sidebar({ user, loading }) {
  if (loading) return null; // optional: show skeleton instead

  const roles = Array.isArray(user?.roles) ? user.roles : [];

  // Use your business rule (first role is "HR"), or a broader check:
  // if (!roles.includes("HR")) return null;
  if (roles[0] !== "HR") return null;

  return (
    <aside className="app-sidebar">
      <nav>
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/rh/listaFuncionarios">Lista Funcionarios</NavLink>
        <NavLink to="/Vagas">Lista de Vagas</NavLink>

      </nav>
    </aside>
  );
}

export default Sidebar;