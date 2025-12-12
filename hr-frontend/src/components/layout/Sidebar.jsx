import { NavLink } from "react-router-dom";

function Sidebar({ role }) {
  return (
    <aside className="app-sidebar">
      {role === "funcionario" && (
        <nav>
          <NavLink to="/">Dashboard</NavLink>
          {/* <NavLink to="/perfil">Meu Perfil</NavLink>
          <NavLink to="/pagamentos">Pagamentos</NavLink>
          <NavLink to="/movimentacoes">Movimentações</NavLink>
          <NavLink to="/notificacoes">Notificações</NavLink> */}
        </nav>
      )}

      {/* {role === "rh" && (
        <nav>
          <NavLink to="/rh/dashboard">Dashboard RH</NavLink>
          <NavLink to="/rh/colaboradores">Colaboradores</NavLink>
          <NavLink to="/rh/candidatos">Candidatos</NavLink>
          <NavLink to="/rh/gestao-pagamentos-mov">
            Pagamentos &amp; Movimentações
          </NavLink>
          <NavLink to="/rh/logs">Logs</NavLink>
          <NavLink to="/notificacoes">Notificações</NavLink>
        </nav>
      )} */}
    </aside>
  );
}

export default Sidebar;