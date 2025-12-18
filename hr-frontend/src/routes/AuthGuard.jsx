import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAccessToken } from "../services/apiClient"; 
import { useAuth } from "../AuthProvider";

function AuthGuard() {
  const token = getAccessToken();
  const location = useLocation();
  const {user} = useAuth();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
   } 
  return <Outlet />;
}

export default AuthGuard;