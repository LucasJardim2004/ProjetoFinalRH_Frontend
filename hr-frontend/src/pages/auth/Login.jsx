import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "/src/AuthProvider.jsx";
import "./auth.css";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(identifier, password);

      navigate("/");
    } catch (err) {
      setError(err.message || "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Company System</h1>
          <p>Área reservada a Funcionários</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="identifier">Email</label>
            <input
              id="identifier"
              type="email"
              placeholder="ex: user@email.com"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Palavra-passe</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "A entrar..." : "Entrar"}
          </button>

          {error && <div className="error">{error}</div>}
        </form>

        <div className="login-footer">
          <span>© {new Date().getFullYear()} Company</span>
        </div>
      </div>
    </div>
  );
}

export default Login;

