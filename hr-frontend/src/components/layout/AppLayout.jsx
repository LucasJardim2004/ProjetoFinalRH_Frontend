
// /src/components/layout/AppLayout.jsx
import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import { Outlet } from "react-router-dom";
import "./layout.css";
import { useAuth } from "/src/AuthProvider.jsx";

function AppLayout() {
  const { user, loading } = useAuth();

  console.log("[AppLayout] user:", user, "loading:", loading);

  return (
    <div className="app-shell">
      <Header user={user} />

      <div className="app-body">
        {/* Render Sidebar only after we know user state to avoid flicker */}
        {!loading && <Sidebar user={user} loading={loading} />}

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
