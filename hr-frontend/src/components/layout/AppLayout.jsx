import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";
import { Outlet } from "react-router-dom";
import "./layout.css";

function AppLayout({ role }) {
  return (
    <div className="app-shell">
      <Header role={role} />

      <div className="app-body">
        <Sidebar role={role} />

        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;