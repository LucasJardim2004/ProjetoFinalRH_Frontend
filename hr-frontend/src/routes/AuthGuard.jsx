
// /src/routes/AuthGuard.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAccessToken } from "../services/apiClient"; // adjust path

function AuthGuard() {
  const token = getAccessToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
   }
  return <Outlet />;
}

export default AuthGuard;