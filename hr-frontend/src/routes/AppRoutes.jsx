import { BrowserRouter, Routes, Route } from "react-router-dom";
import RequireAuth from "../routes/AuthGuard.jsx";
import RequireRole from "../routes/RequireRole.jsx";
import AuthProvider from "../AuthProvider.jsx";

// Layout
import AppLayout from "../components/layout/AppLayout.jsx";

// Páginas públicas
import Login from "../pages/auth/Login.jsx";
import Candidatura from "../pages/publico/Candidatura.jsx";
import Vagas from "../pages/publico/Vagas.jsx";

// Páginas de funcionário
import DashboardFuncionario from "../pages/funcionario/DashboardFuncionario.jsx";

// Páginas RH
import CriarVaga from "../pages/rh/CriarVaga.jsx";
import EditarVaga from "../pages/rh/EditarVaga.jsx";
import ListaFuncionarios from "../pages/rh/ListaFuncionarios.jsx";
import ListaCandidaturas from "../pages/rh/ListaCandidaturas.jsx";

function AppRoutes() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/vagas" element={<Vagas />} />
          <Route path="/candidatura" element={<Candidatura />} />

          {/* Rotas autenticadas */}
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              {/* Dashboard pessoal – funcionário ou RH */}
              <Route index element={<DashboardFuncionario />} />

              {/* Dashboard de um funcionário específico */}
              <Route
                path="/funcionario/:businessEntityID"
                element={<DashboardFuncionario />}
              />

              {/* Bloco de rotas RH – exige role HR */}
              <Route element={<RequireRole allowed={['HR']} />}>
                <Route path="/rh/criarVaga" element={<CriarVaga />} />
                <Route path="/rh/editarVaga" element={<EditarVaga />} />
                <Route path="/rh/listaFuncionarios" element={<ListaFuncionarios />} />
                <Route path="/rh/listaCandidaturas" element={<ListaCandidaturas />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
   );
}

export default AppRoutes;
