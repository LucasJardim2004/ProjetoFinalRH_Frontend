import { createContext, useContext, useEffect, useState } from "react";
import {
  getAccessToken,
  login as apiLogin,
  logout as apiLogout,
  me,
  AUTH_STORAGE_KEY,
} from "/src/services/apiClient";

const AuthContext = createContext({
  user: null,
  loading: true,
  login: async (_email, _password) => {},
  logout: () => {},
  refreshUser: async () => {},
});

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getAccessToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      setLoading(true);
      try {
        const currentToken = getAccessToken();

        if (currentToken !== token) {
          setToken(currentToken || null);
        }

        if (!currentToken) {
          if (!cancelled) setUser(null);
          return;
        }

        const profile = await me(); 
        if (!cancelled) setUser(profile);
      } catch (err) {
        console.error("[AuthProvider] me() failed:", err);
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadUser();
    return () => {
      cancelled = true;
    };
  }, [token]);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === AUTH_STORAGE_KEY) {
        setToken(getAccessToken() || null);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  async function login(email, password) {
    try {
      await apiLogin(email, password); 
      setToken(getAccessToken() || null);
    } catch (err) {
      setLoading(false);
      throw err;
    }
  }

  async function logout() {
    try {
      await apiLogout(); 
    } finally {
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  }

  async function refreshUser() {
    try {
      const currentToken = getAccessToken();
      if (!currentToken) {
        setUser(null);
        return;
      }
      setLoading(true);
      const profile = await me();
      setUser(profile);
    } catch (err) {
           console.error("[AuthProvider] refreshUser failed:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}