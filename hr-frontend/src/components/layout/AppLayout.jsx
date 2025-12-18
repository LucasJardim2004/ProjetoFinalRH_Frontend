import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import { useAuth } from "../../AuthProvider.jsx";

function AppLayout() {
  const { user, loading } = useAuth();

  return (
    <div className="app-shell">
      <Header user={user} loading={loading} />
      <div className="app-body">
        {/* Sidebar só aparece se for RH*/}
        <Sidebar user={user} loading={loading} />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;