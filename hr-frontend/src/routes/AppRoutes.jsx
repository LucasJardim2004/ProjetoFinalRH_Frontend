import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthGuard from "/src/routes/AuthGuard.jsx"; // absolute path (Vite supports it)
// Layout
import AppLayout from "../components/layout/AppLayout.jsx";
import AuthProvider from "../AuthProvider.jsx";

// Páginas públicas
import Login from "../pages/auth/Login.jsx";
import Candidatura from "../pages/publico/Candidatura.jsx";
import Vagas from "../pages/publico/Vagas.jsx";

// Páginas de funcionário
import DashboardFuncionario from "../pages/funcionario/DashboardFuncionario.jsx";
// import Notificacoes from "../pages/comuns/Notificacoes.jsx";

// Páginas RH
import CriarVaga from "../pages/rh/CriarVaga.jsx";
import EditarVaga from "../pages/rh/EditarVaga.jsx";
import ListaFuncionarios from "../pages/rh/ListaFuncionarios.jsx";
import ListaCandidaturas from "../pages/rh/ListaCandidaturas.jsx";
import { use } from "react";
// import LogsRh from "../pages/rh/LogsRh.jsx";

function AppRoutes() {
  const { user, loading } = AuthProvider(); 

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas (sem header/sidebar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/vagas" element={<Vagas />} />
          <Route path="/candidatura" element={<Candidatura />} />

          <Route element={<AuthGuard />}>
              <Route
                path= "/funcionario/:businessEntityID"  
                element={<DashboardFuncionario />}
              />

              {/* Área interna COM header + sidebar */}
              <Route path="/" element={<AppLayout role={user.role} />}>
                {/* Página inicial: dashboard do funcionário */}
                  <Route index element={<DashboardFuncionario />} />
                 
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
