import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout
import AppLayout from "../components/layout/AppLayout.jsx";

// Páginas públicas
import Login from "../pages/auth/Login.jsx";
import Candidatura from "../pages/publico/Candidatura.jsx";
import Vagas from "../pages/publico/Vagas.jsx";

// Páginas de funcionário
import DashboardFuncionario from "../pages/funcionario/DashboardFuncionario.jsx";
// import PerfilFuncionario from "../pages/funcionario/PerfilFuncionario.jsx";
// import PagamentosFuncionario from "../pages/funcionario/PagamentosFuncionario.jsx";
// import MovimentacoesFuncionario from "../pages/funcionario/MovimentacoesFuncionario.jsx";
// import Notificacoes from "../pages/comuns/Notificacoes.jsx";

// Páginas RH
import CriarVaga from "../pages/rh/CriarVaga.jsx";
import EditarVaga from "../pages/rh/EditarVaga.jsx";
// import DashboardRh from "../pages/rh/DashboardRh.jsx";
// import ColaboradoresList from "../pages/rh/ColaboradoresList.jsx";
// import ColaboradorDetalhe from "../pages/rh/ColaboradorDetalhe.jsx";
// import GestaoPagamentosMov from "../pages/rh/GestaoPagamentosMov.jsx";
// import CandidatosList from "../pages/rh/CandidatosList.jsx";
// import CandidatoDetalhe from "../pages/rh/CandidatoDetalhe.jsx";
// import LogsRh from "../pages/rh/LogsRh.jsx";

function AppRoutes() {
  // Por agora “forçamos” um role para ver o layout a funcionar
  const fakeRole = "funcionario"; // ou "rh"

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas (sem header/sidebar) */}
        <Route path="/login" element={<Login />} />
        <Route path="/candidatura" element={<Candidatura />} />
        <Route path="/vagas" element={<Vagas />} />

        <Route path="/rh/criarVaga" element={<CriarVaga />} />
        <Route path="/rh/editarVaga" element={<EditarVaga />} />

        {/* Área interna COM header + sidebar */}
        <Route path="/" element={<AppLayout role={fakeRole} />}>
          {/* Página inicial: dashboard do funcionário */}
          <Route index element={<DashboardFuncionario />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
