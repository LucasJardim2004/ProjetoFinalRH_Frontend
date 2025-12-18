// /src/routes/AppRoutes.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthGuard from "/src/routes/AuthGuard.jsx";
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
          {/* Rotas públicas (sem header/sidebar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/vagas" element={<Vagas />} />
          <Route path="/candidatura" element={<Candidatura />} />

          {/* Rotas autenticadas */}
          <Route element={<AuthGuard />}>
            {/* Área interna com layout (header + sidebar condicional) */}
            <Route element={<AppLayout />}>
              {/* Dashboard “minha” – funcionário ou RH */}
              <Route index element={<DashboardFuncionario />} />

              {/* Dashboard de um funcionário específico (usado pelo RH) */}
              <Route
                path="/funcionario/:businessEntityID"
                element={<DashboardFuncionario />}
              />

              {/* Páginas RH */}
              <Route path="/rh/criarVaga" element={<CriarVaga />} />
              <Route path="/rh/editarVaga" element={<EditarVaga />} />
              <Route
                path="/rh/listaFuncionarios"
                element={<ListaFuncionarios />}
              />
              <Route
                path="/rh/listaCandidaturas"
                element={<ListaCandidaturas />}
              />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default AppRoutes;