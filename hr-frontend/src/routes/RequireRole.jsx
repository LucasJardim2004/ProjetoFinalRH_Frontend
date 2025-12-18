import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../AuthProvider";

function RequireRole({ allowed }) {
  const location = useLocation();
  const { user, loading } = useAuth();

  const roles = Array.isArray(user?.roles) ? user.roles : [];
  const hasRole = roles.some(r => allowed.includes(r));

  if (!hasRole) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default RequireRole;

